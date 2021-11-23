use super::*;

use graph::{Mutation, Query, Subscription};

use axum::extract::ws::WebSocketUpgrade;
use headers::authorization::Bearer;
use headers::Authorization;

use ::graphql::http::ALL_WEBSOCKET_PROTOCOLS as GRAPHQL_WEBSOCKET_PROTOCOLS;
use ::graphql::Schema as GraphQLSchema;
use ::graphql::ServerError as GraphQLError;

use graphql_axum::graphql_subscription;
use graphql_axum::GraphQLRequest;
use graphql_axum::GraphQLResponse;
use graphql_axum::SecWebsocketProtocol as WebSocketProtocol;

#[derive(Clone, Builder)]
pub struct GraphQLExtension {
    services: Services,
    schema: GraphQLSchema<Query, Mutation, Subscription>,
}

pub async fn graphql_handler(
    Extension(extension): Extension<GraphQLExtension>,
    authorization: Option<HeaderExtractor<Authorization<Bearer>>>,
    request: Option<GraphQLRequest>,
    websocket: Option<WebSocketUpgrade>,
    websocket_protocol: Option<HeaderExtractor<WebSocketProtocol>>,
) -> HandlerResult<Response<BoxBody>> {
    let GraphQLExtension { services, schema } = extension;

    // Try to serve GraphQL subscription over websockets
    if let (Some(websocket), Some(HeaderExtractor(protocol))) =
        (websocket, websocket_protocol)
    {
        let response = websocket
            .protocols(GRAPHQL_WEBSOCKET_PROTOCOLS)
            .on_upgrade(move |websocket| async move {
                trace!("received WebSocket connection");
                graphql_subscription(websocket, schema, protocol).await
            })
            .into_response();
        let (head, body) = response.into_parts();
        let response = Response::from_parts(head, boxed(body));
        return Ok(response);
    }

    // Try to serve GraphQL request
    if let Some(GraphQLRequest(request)) = request {
        let request = match authorization {
            Some(HeaderExtractor(Authorization(bearer))) => {
                let identity = services
                    .auth0()
                    .identify(bearer.token())
                    .await
                    .context("authentication failed")?;
                request.data(identity)
            }
            None => request,
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
        let response = GraphQLResponse::from(response).into_response();
        let (head, body) = response.into_parts();
        let response = Response::from_parts(head, boxed(body));
        return Ok(response);
    }

    // Invalid request
    {
        let response = StatusCode::BAD_REQUEST.into_response();
        let (head, body) = response.into_parts();
        let response = Response::from_parts(head, boxed(body));
        Ok(response)
    }
}
