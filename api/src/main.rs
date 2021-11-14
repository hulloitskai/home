use home_api::entities::BuildInfo;
use home_api::entities::Email;
use home_api::env::load as load_env;
use home_api::env::var as env_var;
use home_api::env::var_or as env_var_or;
use home_api::graph::{Mutation, Query, Subscription};
use home_api::handlers::graphql_handler;
use home_api::handlers::graphql_playground_handler;
use home_api::handlers::health_webhook_handler;
use home_api::handlers::GraphQLExtension;
use home_api::handlers::GraphQLPlaygroundExtension;
use home_api::handlers::HealthWebhookExtension;
use home_api::services::Config as ServicesConfig;
use home_api::services::LyriclyService;
use home_api::services::Services;
use home_api::services::Settings;
use home_api::services::{Auth0Service, Auth0ServiceConfig};
use home_api::services::{ObsidianService, ObsidianServiceConfig};
use home_api::services::{SpotifyService, SpotifyServiceConfig};
use home_api::util::default;

use std::env::VarError as EnvVarError;
use std::net::SocketAddr;
use std::str::FromStr;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use http::header::{HeaderName, HeaderValue, InvalidHeaderValue};
use http::header::{AUTHORIZATION, CONTENT_TYPE};
use http::Method;

use tower::ServiceBuilder;
use tower_http::cors::any as cors_any;
use tower_http::cors::AnyOr as CorsAnyOr;
use tower_http::cors::CorsLayer;
use tower_http::cors::Origin as CorsOrigin;
use tower_http::trace::TraceLayer;

use axum::body::Body;
use axum::handler::Handler;
use axum::routing::on;
use axum::routing::MethodFilter;
use axum::{AddExtensionLayer, Router, Server};

use graphql::extensions::apollo_persisted_queries as graphql_apq;
use graphql::Schema as GraphQLSchema;
use graphql_apq::ApolloPersistedQueries as GraphQLAPQExtension;
use graphql_apq::LruCacheStorage as GraphQLAPQStorage;

use mongodb::options::ClientOptions as MongoClientOptions;
use mongodb::Client as MongoClient;

use tracing::{debug, info};
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

#[tokio]
async fn main() -> Result<()> {
    // Load environment variables
    load_env().context("failed to load environment variables")?;

    // Initialize tracer
    debug!("initializing tracer");
    tracing_registry()
        .with(TracingEnvFilter::from_default_env())
        .with(fmt_tracing_layer())
        .with(sentry_tracing_layer())
        .try_init()
        .context("failed to initialize tracer")?;

    // Read environment name
    let environment = match env_var("TEMPLATE_ENV") {
        Ok(environment) => Some(environment),
        Err(EnvVarError::NotPresent) => None,
        Err(error) => {
            return Err(error)
                .context("failed to read environment variable TEMPLATE_ENV")
        }
    };

    // Read build info
    let build = {
        let timestamp = DateTime::<FixedOffset>::parse_from_rfc3339(env!(
            "BUILD_TIMESTAMP"
        ))
        .context("failed to parse build timestamp")?;
        let version = env!("CARGO_PKG_VERSION").to_owned();
        BuildInfo { timestamp, version }
    };

    // Initialize Sentry (if SENTRY_DSN is set)
    let _guard = match env_var("SENTRY_DSN") {
        Ok(dsn) => {
            debug!("initializing Sentry");
            let dsn = dsn.into_dsn().context("failed to parse Sentry DSN")?;
            let release = {
                let name = env!("CARGO_PKG_NAME");
                format!("{}@{}", name, &build.version)
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
        Err(EnvVarError::NotPresent) => None,
        Err(error) => {
            return Err(error)
                .context("failed to read environment variable SENTRY_DSN")
        }
    };

    // Build settings
    let settings = Settings::builder()
        .web_base_url({
            let url = env_var("HOME_WEB_BASE_URL").context(
                "failed to read environment variable HOME_WEB_BASE_URL",
            )?;
            url.parse().context("failed to parse home-web base URL")?
        })
        .web_public_base_url({
            let url = env_var("HOME_WEB_PUBLIC_BASE_URL").context(
                "failed to read environment variable HOME_WEB_PUBLIC_BASE_URL",
            )?;
            url.parse()
                .context("failed to parse home-web public base URL")?
        })
        .api_base_url({
            let url = env_var("HOME_API_BASE_URL").context(
                "failed to read environment variable HOME_API_BASE_URL",
            )?;
            url.parse().context("failed to parse home-api base URL")?
        })
        .api_public_base_url({
            let url = env_var("HOME_API_PUBLIC_BASE_URL").context(
                "failed to read environment variable HOME_API_PUBLIC_BASE_URL",
            )?;
            url.parse()
                .context("failed to parse home-api public base URL")?
        })
        .build();

    // Connect to database
    let database_client = {
        let uri = env_var_or("MONGO_URI", "mongodb://localhost:27017")
            .context("failed to read environment variable MONGO_URI")?;
        let options = {
            let mut options = MongoClientOptions::parse(uri)
                .await
                .context("failed to parse MongoDB connection string")?;
            options.retry_writes = true.into();
            options
        };
        MongoClient::with_options(options)
            .context("failed to build MongoDB client")?
    };

    // Connect to MongoDB
    info!("connecting to database");
    let database = {
        let name = env_var_or("MONGO_DATABASE", "home")
            .context("failed to read environment variable MONGO_DATABASE")?;
        let database = database_client.database(&name);
        database
            .run_command(doc! { "ping": 1 }, None)
            .await
            .context("failed to connect to MongoDB")?;
        database
    };

    info!("initializing services");

    // Build Obsidian service
    let obsidian = {
        let vault_path = env_var("OBSIDIAN_VAULT_PATH").context(
            "failed to read environment variable OBSIDIAN_VAULT_PATH",
        )?;
        ObsidianService::new({
            ObsidianServiceConfig::builder()
                .vault_path(vault_path)
                .build()
        })
        .context("failed to initialize Obsidian client")?
    };

    // Build Spotify service
    let spotify = {
        let client_id = env_var("SPOTIFY_CLIENT_ID")
            .context("failed to read environment variable SPOTIFY_CLIENT_ID")?;
        let client_secret = env_var("SPOTIFY_CLIENT_SECRET").context(
            "failed to read environment variable SPOTIFY_CLIENT_SECRET",
        )?;
        let refresh_token = env_var("SPOTIFY_REFRESH_TOKEN").context(
            "failed to read environment variable SPOTIFY_REFRESH_TOKEN",
        )?;
        SpotifyService::new({
            SpotifyServiceConfig::builder()
                .client_id(client_id)
                .client_secret(client_secret)
                .refresh_token(refresh_token)
                .build()
        })
    };

    // Build Lyricly service
    let lyricly = LyriclyService::new();

    // Build Auth0 service
    let auth0 = {
        let admin_email = env_var("HOME_ADMIN_EMAIL")
            .context("failed to read environment variable HOME_ADMIN_EMAIL")?;
        let admin_email = Email::from_str(&admin_email)
            .context("failed to parse admin email")?;
        let issuer_base_url = env_var("AUTH0_ISSUER_BASE_URL").context(
            "failed to read environment variable AUTH0_ISSUER_BASE_URL",
        )?;
        let issuer_base_url = Url::parse(&issuer_base_url)
            .context("failed to parse Auth0 issuer base URL")?;
        Auth0Service::new({
            Auth0ServiceConfig::builder()
                .issuer_base_url(issuer_base_url)
                .admin_email(admin_email)
                .build()
        })
    };

    // Build services
    let services = Services::new({
        ServicesConfig::builder()
            .database_client(database_client)
            .database(database)
            .settings(settings.clone())
            .obsidian(obsidian)
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
            match env_var("HOME_API_CORS_ALLOW_ORIGIN") {
                Ok(origin) => {
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
                Err(EnvVarError::NotPresent) => {
                    let Settings {
                        web_base_url,
                        web_public_base_url,
                        api_base_url,
                        api_public_base_url,
                        ..
                    } = &settings;
                    let origins = [
                        web_base_url,
                        web_public_base_url,
                        api_base_url,
                        api_public_base_url,
                    ]
                    .into_iter()
                    .map(|url| {
                        let mut url = url.to_owned();
                        url.set_path("");
                        let mut url = url.to_string();
                        url.pop();
                        HeaderValue::from_str(&url)
                    })
                    .collect::<Result<Vec<_>, InvalidHeaderValue>>()
                    .context("failed to parse CORS origin")?;
                    CorsOrigin::list(origins).into()
                }
                Err(error) => {
                    return Err(error).context(
                        "invalid environment variable \
                            HOME_API_CORS_ALLOW_ORIGIN",
                    )
                }
            }
        });

    // Build routes
    let routes = Router::<Body>::new()
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
                .layer(TraceLayer::new_for_http())
        })
        .into_make_service();

    let host = env_var_or("TEMPLATE_API_HOST", "0.0.0.0")
        .context("failed to get environment variable TEMPLATE_API_HOST")?;
    let port = env_var_or("TEMPLATE_API_PORT", "3000")
        .context("failed to get environment variable TEMPLATE_API_PORT")?;
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
