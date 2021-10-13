use bson::doc;
use tokio::main as tokio;
use tracing_subscriber::fmt::init as init_tracer;

use std::convert::Infallible;
use std::net::SocketAddr;

use ent::Comparison;
use ent::Entity;
use ent::Record;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use http::header::CONTENT_TYPE;
use http::{Response, StatusCode};

use warp::body::json as body_json;
use warp::path::end as path_end;
use warp::reject::custom as rejection;
use warp::reject::Reject;
use warp::reply::json as reply_json;
use warp::reply::with_status as reply_with_status;
use warp::{get, head, path, post, serve};
use warp::{Filter, Rejection, Reply};

use warp_graphql::graphql as warp_graphql;
use warp_graphql::graphql_subscription as warp_graphql_subscription;
use warp_graphql::BadRequest as BadWarpGraphQLRequest;
use warp_graphql::Response as WarpGraphQLResponse;

use graphql::http::playground_source as graphql_playground_source;
use graphql::http::GraphQLPlaygroundConfig;
use graphql::Request as GraphQLRequest;
use graphql::Response as GraphQLResponse;
use graphql::{EmptyMutation, EmptySubscription, Schema};

use graphql::extensions::apollo_persisted_queries as graphql_apq;
use graphql_apq::ApolloPersistedQueries as GraphQLAPQExtension;
use graphql_apq::LruCacheStorage as GraphQLAPQStorage;

use mongodb::options::ClientOptions as MongoClientOptions;
use mongodb::Client as MongoClient;

mod util;

mod prelude;
use prelude::*;

mod env;
use env::load as load_env;
use env::var as env_var;
use env::var_or as env_var_or;

mod entities;
use entities::BuildInfo;
use entities::{Context, Services, Settings};
use entities::{HeartRate, HeartRateConditions};

mod graph;
use graph::Query;

mod auth;

mod spotify;
use spotify::Client as SpotifyClient;
use spotify::ClientConfig as SpotifyClientConfig;

mod obsidian;
use obsidian::Client as ObsidianClient;
use obsidian::ClientConfig as ObsidianClientConfig;

mod lyricly;
use lyricly::Client as LyriclyClient;

#[tokio]
async fn main() -> Result<()> {
    // Load environment variables and initialize tracer.
    load_env().context("failed to load environment variables")?;
    init_tracer();

    // Read build info.
    let timestamp: DateTime<FixedOffset> =
        DateTime::parse_from_rfc3339(env!("BUILD_TIMESTAMP"))
            .context("failed to parse build timestamp")?;
    let version = match env!("BUILD_VERSION") {
        "" => None,
        version => Some(version.to_owned()),
    };
    let build_info = BuildInfo { timestamp, version };

    // Connect to database.
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
    info!(target: "home-api", "connecting to database");
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

    info!(target: "home-api", "initializing services");

    // Build Obsidian client.
    let obsidian = {
        let vault_path = env_var("OBSIDIAN_VAULT_PATH").context(
            "failed to read environment variable OBSIDIAN_VAULT_PATH",
        )?;
        let config = ObsidianClientConfig::builder()
            .vault_path(vault_path)
            .build();
        ObsidianClient::new(config)
            .context("failed to initialize Obsidian client")?
    };

    // Build Spotify client.
    let spotify = {
        let client_id = env_var("SPOTIFY_CLIENT_ID")
            .context("failed to read environment variable SPOTIFY_CLIENT_ID")?;
        let client_secret = env_var("SPOTIFY_CLIENT_SECRET").context(
            "failed to read environment variable SPOTIFY_CLIENT_SECRET",
        )?;
        let refresh_token = env_var("SPOTIFY_REFRESH_TOKEN").context(
            "failed to read environment variable SPOTIFY_REFRESH_TOKEN",
        )?;
        let config = SpotifyClientConfig::builder()
            .client_id(client_id)
            .client_secret(client_secret)
            .refresh_token(refresh_token)
            .build();
        SpotifyClient::new(config)
    };

    // Build Lyricly client.
    let lyricly = LyriclyClient::new();

    // Build settings.
    let settings = Settings::builder()
        .web_public_url({
            let url = env_var("HOME_WEB_PUBLIC_URL").context(
                "failed to read environment variable HOME_WEB_PUBLIC_URL",
            )?;
            url.parse().context("failed to parse home-web public URL")?
        })
        .api_public_url({
            let url = env_var("HOME_API_PUBLIC_URL").context(
                "failed to read environment variable HOME_API_PUBLIC_URL",
            )?;
            url.parse().context("failed to parse home-api public URL")?
        })
        .build();

    // Build services.
    let services = Services::builder()
        .database_client(database_client)
        .database(database)
        .settings(settings)
        .obsidian(obsidian)
        .spotify(spotify)
        .lyricly(lyricly)
        .build();

    // Build entity context.
    let ctx = Context::new(services);

    // Build GraphQL schema.
    let graphql_schema = {
        let query = Query::new();
        let mutation = EmptyMutation;
        let subscription = EmptySubscription;
        Schema::build(query, mutation, subscription)
            .extension({
                let storage = GraphQLAPQStorage::new(1024);
                GraphQLAPQExtension::new(storage)
            })
            .data(build_info)
            .data(ctx.clone())
            .finish()
    };

    // Build GraphQL filter.
    let graphql_filter = {
        let graphql = {
            warp_graphql(graphql_schema.clone()).untuple_one().and_then(
                |schema: Schema<_, _, _>, request: GraphQLRequest| async move {
                    let response = schema.execute(request).await;
                    trace_graphql_response(&response);
                    let response = WarpGraphQLResponse::from(response);
                    Ok::<_, Infallible>(response)
                },
            )
        };
        let graphql_subscription = warp_graphql_subscription(graphql_schema);
        path("graphql")
            .and(path_end())
            .and(graphql_subscription.or(graphql))
    };

    // Build GraphQL playground filter.
    let graphql_playground_filter = (get().or(head()))
        .map({
            let ctx = ctx.clone();
            move |_| ctx.clone()
        })
        .and_then(|ctx: Context| async move {
            let endpoint = {
                let mut endpoint = ctx.settings().api_public_url.clone();
                if !matches!(endpoint.scheme(), "http" | "https") {
                    let error = ErrorRejection::new(
                        "invalid GraphQL playground endpoint scheme",
                    );
                    return Err(rejection(error));
                }
                let path = endpoint.path();
                if !path.ends_with('/') {
                    let path = path.to_owned() + "/";
                    endpoint.set_path(&path);
                }
                endpoint.join("graphql").unwrap()
            };

            let subscription_endpoint = {
                let mut endpoint = endpoint.clone();
                let scheme = match endpoint.scheme() {
                    "http" => "ws",
                    "https" => "wss",
                    _ => {
                        panic!("invalid GraphQL playground endpoint scheme")
                    }
                };
                endpoint.set_scheme(scheme).unwrap();
                endpoint
            };

            let config = GraphQLPlaygroundConfig::new(endpoint.as_str())
                .subscription_endpoint(subscription_endpoint.as_str());
            let source = graphql_playground_source(config);
            Ok(source)
        })
        .map(|source: String| {
            Response::builder()
                .header(CONTENT_TYPE, "text/html")
                .body(source)
        });

    // Build health webhook filter.
    let health_webhook_filter = post()
        .map({
            let ctx = ctx.clone();
            move || ctx.clone()
        })
        .and(body_json())
        .and_then(|ctx: Context, payload: HealthExportPayload| async move {
            if let Err(error) = import_health_data(&ctx, payload).await {
                error!(
                    target: "home-api",
                    error = %format!("{:?}", error),
                    "failed to import health data",
                );
                return Err(rejection(ErrorRejection::from(error)));
            }
            Ok(())
        })
        .untuple_one()
        .map(|| StatusCode::OK);

    // Build root webhook filter.
    let webhook_filter =
        path("hooks").and(path("health").and(health_webhook_filter));

    // Build root filter.
    let filter = (path_end().and(graphql_playground_filter))
        .or(graphql_filter)
        .or(webhook_filter)
        .recover(recover);

    let host = env_var_or("HOME_API_HOST", "0.0.0.0")
        .context("failed to get environment variable HOME_API_HOST")?;
    let port = env_var_or("HOME_API_PORT", "3000")
        .context("failed to get environment variable HOME_API_PORT")?;
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .context("failed to parse server address")?;

    info!(target: "home-api", "listening on http://{}", &addr);
    serve(filter).run(addr).await;
    Ok(())
}

async fn recover(rejection: Rejection) -> Result<impl Reply, Infallible> {
    let (error, status_code) = if rejection.is_not_found() {
        let error = ErrorRejection::new("not found");
        (error, StatusCode::NOT_FOUND)
    } else if let Some(error) = rejection.find::<ErrorRejection>() {
        let error = error.to_owned();
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    } else if let Some(error) = rejection.find::<BadWarpGraphQLRequest>() {
        let BadWarpGraphQLRequest(error) = error;
        let error = ErrorRejection::new(error.to_string());
        (error, StatusCode::BAD_REQUEST)
    } else if let Some(error) = rejection.find::<Error>() {
        let error = ErrorRejection::from(error);
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    } else {
        error!(target: "home-api", "unhandled rejection: {:?}", &rejection);
        let error = ErrorRejection::new("internal server error");
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    };

    let reply = ErrorReply {
        errors: vec![error],
        status_code: status_code.as_u16(),
    };
    let reply = reply_json(&reply);
    let reply = reply_with_status(reply, status_code);
    Ok::<_, Infallible>(reply)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorReply {
    errors: Vec<ErrorRejection>,
    status_code: u16,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorRejection {
    message: Cow<'static, str>,
}

impl ErrorRejection {
    pub fn new(msg: impl Into<Cow<'static, str>>) -> Self {
        Self {
            message: msg.into(),
        }
    }
}

impl Reject for ErrorRejection {}

impl From<&Error> for ErrorRejection {
    fn from(error: &Error) -> Self {
        let msg = format!("{:#}", error);
        Self::new(msg)
    }
}

impl From<Error> for ErrorRejection {
    fn from(error: Error) -> Self {
        Self::from(&error)
    }
}

fn trace_graphql_response(response: &GraphQLResponse) {
    response
        .errors
        .iter()
        .for_each(|error| match error.message.as_str() {
            "PersistedQueryNotFound" => (),
            _ => {
                error!(target: "home-api", "GraphQL error: {:#}", error)
            }
        })
}

#[derive(Debug, Deserialize)]
struct HealthExportPayload {
    data: HealthExportData,
}

#[derive(Debug, Deserialize)]
struct HealthExportData {
    metrics: Vec<HealthExportMetric>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "name", rename_all = "snake_case")]
enum HealthExportMetric {
    HeartRate(HealthExportHeartRate),
}

#[derive(Debug, Deserialize)]
struct HealthExportHeartRate {
    data: Vec<HealthExportHeartRateMeasurement>,
}

#[derive(Debug, Deserialize)]
struct HealthExportHeartRateMeasurement {
    date: String,
    #[serde(rename = "Avg")]
    avg: f64,
}

async fn import_health_data(
    ctx: &Context,
    payload: HealthExportPayload,
) -> Result<()> {
    for metric in payload.data.metrics {
        let HealthExportMetric::HeartRate(rate) = metric;
        for measurement in rate.data {
            let HealthExportHeartRateMeasurement {
                avg: measurement,
                date: timestamp,
            } = measurement;
            let measurement = measurement.round() as u16;
            let timestamp = {
                let timestamp = DateTime::parse_from_str(
                    &timestamp, "%F %T %z",
                )
                .context("failed to parse heart rate measurement date")?;
                DateTime::from(timestamp)
            };

            ctx.transact(|ctx| async move {
                let rate_exists = HeartRate::find_one({
                    let timestamp = DateTime::from(timestamp);
                    HeartRateConditions::builder()
                        .timestamp(Comparison::Eq(timestamp))
                        .build()
                })
                .exists(&ctx)
                .await
                .context("failed to lookup conflicting heart rates")?;
                if !rate_exists {
                    let mut rate = Record::new({
                        HeartRate::builder()
                            .measurement(measurement)
                            .timestamp(timestamp)
                            .build()
                    });
                    rate.save(&ctx).await?;
                } else {
                    debug!(
                        target: "home-api",
                        %timestamp,
                        "existing heart rate for timestamp",
                    )
                }
                Ok(())
            })
            .await
            .context("failed to save heart rate")?;
        }
    }
    Ok(())
}
