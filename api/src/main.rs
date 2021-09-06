use bson::doc;
use entities::Comparison;
use http::{Response, StatusCode};
use tracing_subscriber::fmt::init as init_tracer;

use std::borrow::Cow;
use std::convert::Infallible;
use std::net::SocketAddr;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use warp::body::json as body_json;
use warp::path::end as path_end;
use warp::reject::custom as rejection;
use warp::reject::Reject;
use warp::reply::json as reply_json;
use warp::reply::with_status as reply_with_status;
use warp::{get, path, post, serve};
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
use entities::{Context, Entity, Services, Settings};
use entities::{HeartRate, HeartRateConditions};

mod graph;
use graph::Query;

#[tokio::main]
async fn main() -> Result<()> {
    // Load environment variables and initialize tracer.
    load_env().context("failed to load environment variables")?;
    init_tracer();

    // Read build info.
    let timestamp: DateTime<FixedOffset> =
        DateTime::parse_from_rfc3339(env!("BUILD_TIMESTAMP"))
            .context("failed to parse BUILD_TIMESTAMP")?;
    let version = match env!("BUILD_VERSION") {
        "" => None,
        version => Some(version.to_owned()),
    };
    let build_info = BuildInfo { timestamp, version };

    // Connect to database.
    let database_client = {
        let uri = env_var_or("MONGO_URI", "mongodb://localhost:27017")
            .context("failed to read MONGO_URI")?;
        let options = {
            let mut options = MongoClientOptions::parse(uri)
                .await
                .context("failed to parse MONGO_URI")?;
            options.retry_writes = true.into();
            options
        };
        MongoClient::with_options(options)
            .context("failed to build MongoDB client")?
    };

    info!(target: "home-api", "connecting to MongoDB...");
    let database = {
        let database_name = env_var_or("MONGO_DATABASE", "home")
            .context("failed to read MONGO_DATABASE")?;
        let database = database_client.database(&database_name);
        database
            .run_command(doc! { "ping": 1 }, None)
            .await
            .context("failed to connect to MongoDB")?;
        database
    };

    // Build services.
    let services = Services::builder()
        .database_client(database_client)
        .database(database)
        .build();

    // Build settings.
    let settings = {
        let web_public_url = {
            let url = env_var("HOME_WEB_PUBLIC_URL")
                .context("failed to read HOME_WEB_PUBLIC_URL")?;
            url.parse().context("failed to parse HOME_WEB_PUBLIC_URL")?
        };
        Settings::builder().web_public_url(web_public_url).build()
    };

    // Build entity context.
    let context = Context::new(services, settings);

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
            .data(context.clone())
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
    let graphql_playground_filter = get()
        // .and(full_path())
        // .and(header("X-Forwarded-Prefix"))
        // .and(header("X-Envoy-Original-Path")) // TODO: Remove Envoy-specific logic.
        .map(|/* path: FullPath
     prefix: Option<String>,
     envoy_original_path: Option<String> */| {
        // let prefix = prefix.or(envoy_original_path);
        // let endpoint = {
        //     let prefix =
        //         prefix.as_ref().map(String::as_str).unwrap_or("");
        //     let path = path.as_str();
        //     let root = Path::new(path).join(prefix);
        //     let root = root.to_str().unwrap();
        //     format!("{}graphql", root)
        // };
        let config = GraphQLPlaygroundConfig::new("graphql");
        let source = graphql_playground_source(config);
        Response::builder()
            .header("content-type", "text/html")
            .body(source)
    });

    // Build health webhook filter.
    let health_webhook_filter = post()
        .map(move || context.clone())
        .and(body_json())
        .and_then(|ctx: Context, payload: HealthExportPayload| async move {
            if let Err(error) = import_health_data(ctx, payload).await {
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
        path("webhook").and(path("health").and(health_webhook_filter));

    // Build root filter.
    let filter = path_end()
        .and(graphql_playground_filter)
        .or(graphql_filter)
        .or(webhook_filter)
        .recover(recover);

    let host = env_var_or("HOME_API_HOST", "0.0.0.0")
        .context("failed to get server host")?;
    let port = env_var_or("HOME_API_PORT", "3000")
        .context("failed to get server port")?;
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .context("failed to parse server address")?;

    info!(target: "home-api", "listening on http://{}", &addr);
    serve(filter).run(addr).await;
    Ok(())
}

async fn recover(rejection: Rejection) -> Result<impl Reply, Infallible> {
    let (error, status_code) = if rejection.is_not_found() {
        let error = ServerError::new("not found");
        (error, StatusCode::NOT_FOUND)
    } else if let Some(error) = rejection.find::<ErrorRejection>() {
        let ErrorRejection(error) = error;
        let error = ServerError::new(format!("{:#}", error));
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    } else if let Some(error) = rejection.find::<BadWarpGraphQLRequest>() {
        let BadWarpGraphQLRequest(error) = error;
        let error = ServerError::new(error.to_string());
        (error, StatusCode::BAD_REQUEST)
    } else if let Some(error) = rejection.find::<Error>() {
        let error = ServerError::new(format!("{:#}", error));
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    } else {
        error!(target: "home-api", "unhandled rejection: {:?}", &rejection);
        let error = ServerError::new("internal server error");
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    };

    let reply = ServerRejectionReply {
        errors: vec![error],
        status_code: status_code.as_u16(),
    };
    let reply = reply_json(&reply);
    let reply = reply_with_status(reply, status_code);
    Ok::<_, Infallible>(reply)
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
    ctx: Context,
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
            let timestamp = DateTime::parse_from_str(&timestamp, "%F %T %z")
                .context("failed to parse heart rate measurement date")?;

            ctx.transact(|ctx| async move {
                let rate_exists = HeartRate::find_one({
                    let timestamp =DateTime::from(timestamp);
                    HeartRateConditions::builder()
                        .timestamp(Comparison::Eq(timestamp))
                        .build()
                })
                .exists(&ctx)
                .await
                .context("failed to lookup conflicting heart rates")?;
                if !rate_exists {
                    let mut rate = HeartRate::builder()
                        .measurement(measurement)
                        .timestamp(timestamp)
                        .build();
                    rate.save(&ctx).await?;
                } else {
                    debug!(
                        target: "home-api",
                        %timestamp,
                        "heart rate already recorded",
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ServerRejectionReply {
    errors: Vec<ServerError>,
    status_code: u16,
}

#[derive(Debug, Serialize)]
struct ServerError {
    message: Cow<'static, str>,
}

impl ServerError {
    fn new(message: impl Into<Cow<'static, str>>) -> Self {
        Self {
            message: message.into(),
        }
    }
}

#[derive(Debug, From)]
struct ErrorRejection(Error);

impl Reject for ErrorRejection {}

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
