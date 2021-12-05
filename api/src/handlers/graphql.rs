use super::*;

use axum::extract::ws::WebSocketUpgrade;
use graph::{Mutation, Query, Subscription};

use headers::authorization::Bearer;
use headers::Authorization;

use ::graphql::http::ALL_WEBSOCKET_PROTOCOLS as GRAPHQL_WEBSOCKET_PROTOCOLS;
use ::graphql::Data as GraphQLData;
use ::graphql::Result as GraphQLResult;
use ::graphql::Schema as GraphQLSchema;
use ::graphql::ServerError as GraphQLError;

use graphql_axum::GraphQLProtocol as GraphQLWebsocketProtocol;
use graphql_axum::GraphQLRequest;
use graphql_axum::GraphQLResponse;
use graphql_axum::GraphQLSubscription;
use graphql_axum::GraphQLWebSocket;

#[derive(Clone, Builder)]
pub struct GraphQLExtension {
    services: Services,
    schema: GraphQLSchema<Query, Mutation, Subscription>,
}

pub async fn graphql_handler(
    Extension(extension): Extension<GraphQLExtension>,
    authorization: Option<HeaderExtractor<Authorization<Bearer>>>,
    request: Option<GraphQLRequest>,
    ws_upgrade: Option<WebSocketUpgrade>,
    ws_protocol: Option<GraphQLWebsocketProtocol>,
) -> HandlerResult<Response<BoxBody>> {
    let GraphQLExtension { services, schema } = extension;
    let auth0 = services.auth0();

    // Read identity from authorization
    let identity = match authorization {
        Some(HeaderExtractor(Authorization(bearer))) => {
            let identity = auth0
                .identify(bearer.token())
                .await
                .context("authentication failed");
            let identity = match identity {
                Ok(info) => info,
                Err(error) => {
                    error!(
                        error = %format!("{:#}", error),
                        "authentication failed"
                    );
                    return Err(error.into());
                }
            };
            Some(identity)
        }
        None => None,
    };

    // Initial data from request
    let data = {
        let mut data = GraphQLData::default();
        if let Some(identity) = &identity {
            data.insert(identity.clone());
        }
        data
    };

    // Try to serve GraphQL subscription over websockets
    if let (Some(upgrade), Some(protocol)) = (ws_upgrade, ws_protocol) {
        let (head, body) = upgrade
            .protocols(GRAPHQL_WEBSOCKET_PROTOCOLS)
            .on_upgrade(move |stream| async move {
                trace!(
                    identity = %to_json_string(&identity).unwrap(),
                    "handling stream"
                );
                GraphQLWebSocket::new(stream, schema, protocol)
                    .with_data(data)
                    .serve()
                    .await
            })
            .into_response()
            .into_parts();
        let response = Response::from_parts(head, boxed(body));
        return Ok(response);
    }

    // Try to serve GraphQL request
    if let Some(GraphQLRequest(request)) = request {
        trace!(
            identity = %to_json_string(&identity).unwrap(),
            request = %to_json_string(&request).unwrap(),
            "handling request"
        );
        let request = {
            let mut request = request;
            request.data = data;
            request
        };
        let response = schema.execute(request).await;
        response
            .errors
            .iter()
            .for_each(|error| match error.message.as_str() {
                "PersistedQueryNotFound" => (),
                _ => {
                    let GraphQLError {
                        message,
                        locations,
                        path,
                        ..
                    } = error;
                    let locations = {
                        let locations = locations
                            .iter()
                            .map(ToString::to_string)
                            .collect::<Vec<_>>();
                        to_json_string(&locations).unwrap()
                    };
                    let path = to_json_string(path).unwrap();
                    error!(
                        %locations,
                        %path,
                        "{}", message,
                    );
                }
            });

        let (head, body) =
            GraphQLResponse::from(response).into_response().into_parts();
        let response = Response::from_parts(head, boxed(body));
        return Ok(response);
    }

    // Invalid request
    {
        let (head, body) = StatusCode::BAD_REQUEST.into_response().into_parts();
        let response = Response::from_parts(head, boxed(body));
        Ok(response)
    }
}
