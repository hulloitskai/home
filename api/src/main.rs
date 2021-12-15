use api::config::{env, env_opt, load_env, set_env};
use api::config::{PACKAGE_NAME, PROJECT_NAME};
use api::entities::BuildInfo;
use api::graph::{Mutation, Query, Subscription};
use api::handlers::graphql_handler;
use api::handlers::graphql_playground_handler;
use api::handlers::health_webhook_handler;
use api::handlers::GraphQLExtension;
use api::handlers::GraphQLPlaygroundExtension;
use api::handlers::HealthWebhookExtension;
use api::services::Config as ServicesConfig;
use api::services::LyriclyService;
use api::services::Services;
use api::services::Settings;
use api::services::{Auth0Service, Auth0ServiceConfig};
use api::services::{ObsidianService, ObsidianServiceConfig};
use api::services::{SegmentService, SegmentServiceConfig};
use api::services::{SpotifyService, SpotifyServiceConfig};
use api::util::default;

use std::net::SocketAddr;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use http::header::{HeaderName, HeaderValue, InvalidHeaderValue};
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use http::{Method, StatusCode};

use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;
use tower_http::cors::any as cors_any;
use tower_http::cors::AnyOr as CorsAnyOr;
use tower_http::cors::CorsLayer;
use tower_http::cors::Origin as CorsOrigin;
use tower_http::trace::TraceLayer;

use axum::body::Body;
use axum::handler::Handler;
use axum::routing::MethodFilter;
use axum::routing::{get, on};
use axum::{AddExtensionLayer, Router, Server};

use graphql::extensions::apollo_persisted_queries as graphql_apq;
use graphql::Schema as GraphQLSchema;
use graphql_apq::ApolloPersistedQueries as GraphQLAPQExtension;
use graphql_apq::LruCacheStorage as GraphQLAPQStorage;

use mongodb::options::ClientOptions as MongoClientOptions;
use mongodb::options::Compressor as MongoCompressor;
use mongodb::Client as MongoClient;

use tracing::{debug, info, warn};
use tracing_subscriber::fmt::layer as fmt_tracing_layer;
use tracing_subscriber::layer::SubscriberExt as TracingSubscriberLayerExt;
use tracing_subscriber::registry as tracing_registry;
use tracing_subscriber::util::SubscriberInitExt as TracingSubscriberInitExt;
use tracing_subscriber::EnvFilter as TracingEnvFilter;

use sentry::init as init_sentry;
use sentry::ClientOptions as SentryOptions;
use sentry::IntoDsn as IntoSentryDsn;
use sentry_tracing::layer as sentry_tracing_layer;

use bson::doc;
use chrono::{DateTime, FixedOffset};
use tokio::main as tokio;
use url::Url;

async fn run() -> Result<()> {
    // Load environment variables
    load_env().context("failed to load environment variables")?;

    // Configure backtrace
    {
        let backtrace = env_opt("BACKTRACE")?;
        let backtrace = backtrace.unwrap_or_else(|| "1".to_owned());
        set_env("RUST_BACKTRACE", backtrace);
    }

    // Configure logging
    {
        let log = env_opt("LOG").unwrap();
        let log = log.unwrap_or_else(|| "info".to_owned());
        set_env("RUST_LOG", log);
    }

    // Initialize tracer
    debug!("initializing tracer");
    tracing_registry()
        .with(TracingEnvFilter::from_default_env())
        .with(fmt_tracing_layer())
        .with(sentry_tracing_layer())
        .try_init()
        .context("failed to initialize tracer")?;

    // Read environment name
    let environment = env_opt("ENV")?;

    // Read build info
    let build = {
        let timestamp = DateTime::<FixedOffset>::parse_from_rfc3339(env!(
            "BUILD_TIMESTAMP"
        ))
        .context("failed to parse build timestamp")?;
        let version = env!("CARGO_PKG_VERSION").to_owned();
        BuildInfo { timestamp, version }
    };

    // Initialize Sentry
    let sentry_dsn = env_opt("SENTRY_DSN")?;
    let _sentry_guard = match sentry_dsn {
        Some(dsn) => {
            debug!("initializing Sentry");
            let dsn = dsn.into_dsn().context("failed to parse Sentry DSN")?;
            let release = {
                let BuildInfo { version, .. } = &build;
                format!("{}-{}@{}", PROJECT_NAME, PACKAGE_NAME, version)
            };
            let options = SentryOptions {
                dsn,
                release: Some(release.into()),
                environment: environment.clone().map(Into::into),
                ..default()
            };
            let guard = init_sentry(options);
            Some(guard)
        }
        None => {
            warn!("skipping Sentry initialization (missing DSN)");
            None
        }
    };

    // Build settings
    let settings = Settings::builder()
        .base_url({
            let url = env("BASE_URL")
                .context("failed to read environment variable BASE_URL")?;
            url.parse().context("failed to parse base URL")?
        })
        .web_base_url({
            let url = env("WEB_BASE_URL")
                .context("failed to read environment variable WEB_BASE_URL")?;
            url.parse().context("failed to parse web base URL")?
        })
        .build();

    // Connect to database
    let database_client = MongoClient::with_options({
        let uri = env_opt("MONGO_URI")?;
        let uri = uri.unwrap_or_else(|| "mongodb://localhost:27017".to_owned());
        let mut options = MongoClientOptions::parse(uri)
            .await
            .context("failed to parse MongoDB connection string")?;
        options.retry_writes = Some(true);
        options.compressors = {
            let compressor = MongoCompressor::Zstd { level: None };
            Some(vec![compressor])
        };
        options
    })
    .context("failed to build MongoDB client")?;

    // Connect to MongoDB
    info!("connecting to database");
    let database = {
        let name = env("MONGO_DATABASE")?;
        let database = database_client.database(&name);
        database
            .run_command(doc! { "ping": 1 }, None)
            .await
            .context("failed to connect to MongoDB")?;
        database
    };

    info!("initializing services");

    // Build Segment client
    let segment = SegmentService::new({
        let write_key = env("SEGMENT_WRITE_KEY")?;
        SegmentServiceConfig::builder().write_key(write_key).build()
    });

    // Build Obsidian service
    let obsidian = ObsidianService::new({
        let vault_path = env("OBSIDIAN_VAULT_PATH")?;
        ObsidianServiceConfig::builder()
            .vault_path(vault_path)
            .build()
    })
    .context("failed to initialize Obsidian client")?;

    // Build Spotify service
    let spotify = SpotifyService::new({
        let client_id = env("SPOTIFY_CLIENT_ID")?;
        let client_secret = env("SPOTIFY_CLIENT_SECRET")?;
        let refresh_token = env("SPOTIFY_REFRESH_TOKEN")?;
        SpotifyServiceConfig::builder()
            .client_id(client_id)
            .client_secret(client_secret)
            .refresh_token(refresh_token)
            .build()
    });

    // Build Lyricly service
    let lyricly = LyriclyService::new();

    // Build Auth0 service
    let auth0 = Auth0Service::new({
        let issuer_base_url = env("AUTH0_ISSUER_BASE_URL")?;
        let issuer_base_url = Url::parse(&issuer_base_url)
            .context("failed to parse Auth0 issuer base URL")?;
        Auth0ServiceConfig::builder()
            .issuer_base_url(issuer_base_url)
            .build()
    });

    // Build services
    let services = Services::new({
        ServicesConfig::builder()
            .database_client(database_client)
            .database(database)
            .settings(settings.clone())
            .obsidian(obsidian)
            .segment(segment)
            .spotify(spotify)
            .lyricly(lyricly)
            .auth0(auth0)
            .build()
    });

    // Build GraphQL schema
    let graphql_schema = {
        let query = Query::default();
        let mutation = Mutation::default();
        let subscription = Subscription::default();
        GraphQLSchema::build(query, mutation, subscription)
            .extension({
                let storage = GraphQLAPQStorage::new(1024);
                GraphQLAPQExtension::new(storage)
            })
            .data(build)
            .data(services.clone())
            .finish()
    };

    // Build extensions and middleware layers
    let health_webhook_extension = HealthWebhookExtension::builder()
        .services(services.clone())
        .build();
    let graphql_extension = GraphQLExtension::builder()
        .schema(graphql_schema.clone())
        .services(services.clone())
        .build();
    let graphql_playground_extension =
        GraphQLPlaygroundExtension::new(&services)
            .context("failed to initialize GraphQL playground")?;
    let graphql_layer = CorsLayer::new()
        .allow_methods(vec![Method::GET, Method::POST])
        .allow_headers(vec![
            CONTENT_TYPE,
            AUTHORIZATION,
            HeaderName::from_static("sentry-trace"),
        ])
        .allow_credentials(true)
        .allow_origin({
            let allow_origin = env_opt("CORS_ALLOW_ORIGIN")?;
            match allow_origin {
                Some(origin) => {
                    let origin: CorsAnyOr<CorsOrigin> = if origin == "*" {
                        cors_any().into()
                    } else {
                        let origins = origin
                            .split(',')
                            .map(HeaderValue::from_str)
                            .collect::<Result<Vec<_>, InvalidHeaderValue>>()
                            .context("failed to parse CORS origin")?;
                        let list = CorsOrigin::list(origins);
                        list.into()
                    };
                    origin
                }
                None => {
                    let Settings {
                        base_url,
                        web_base_url,
                        ..
                    } = &settings;
                    let origins = [base_url, web_base_url]
                        .into_iter()
                        .map(|url| {
                            let mut url = url.clone();
                            url.set_path("");
                            let mut url = url.to_string();
                            url.pop();
                            HeaderValue::from_str(&url)
                        })
                        .collect::<Result<Vec<_>, InvalidHeaderValue>>()
                        .context("failed to parse CORS origin")?;
                    CorsOrigin::list(origins).into()
                }
            }
        });

    // Build routes
    let routes = Router::<Body>::new()
        .route("/health", get(|| async { (StatusCode::OK, "OK") }))
        .route(
            "/",
            on(
                MethodFilter::HEAD | MethodFilter::OPTIONS | MethodFilter::GET,
                graphql_playground_handler,
            ),
        )
        .route(
            "/graphql",
            on(
                MethodFilter::HEAD
                    | MethodFilter::OPTIONS
                    | MethodFilter::GET
                    | MethodFilter::POST,
                graphql_handler.layer(graphql_layer),
            ),
        )
        .route(
            "/hooks/health",
            on(
                MethodFilter::HEAD | MethodFilter::OPTIONS | MethodFilter::POST,
                health_webhook_handler,
            ),
        );

    // Build service
    let service = routes
        .layer({
            ServiceBuilder::new()
                .layer(AddExtensionLayer::new(health_webhook_extension))
                .layer(AddExtensionLayer::new(graphql_extension))
                .layer(AddExtensionLayer::new(graphql_playground_extension))
                .layer(CookieManagerLayer::new())
                .layer(TraceLayer::new_for_http())
        })
        .into_make_service();

    let host = {
        let host = env_opt("HOST")?;
        host.unwrap_or_else(|| "0.0.0.0".to_owned())
    };
    let port = {
        let port = env_opt("PORT")?;
        port.unwrap_or_else(|| "3000".to_owned())
    };
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .context("failed to parse server address")?;

    info!("listening on http://{}", &addr);
    Server::bind(&addr)
        .serve(service)
        .await
        .context("failed to serve routes")?;
    Ok(())
}

#[tokio]
async fn main() -> Result<()> {
    run().await
}
