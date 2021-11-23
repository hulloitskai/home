mod graphql;
mod graphql_playground;
mod health_webhook;

pub use self::graphql::*;
pub use graphql_playground::*;
pub use health_webhook::*;

use super::*;

use entities::*;
use services::Services;

use entrust::Comparison;
use entrust::Record;
use entrust::{Entity, EntityId};
use entrust::{Object, ObjectId};

use axum::body::boxed;
use axum::body::{Body, BoxBody, Bytes, Full};
use axum::extract::Extension;
use axum::extract::Json as JsonExtractor;
use axum::extract::TypedHeader as HeaderExtractor;
use axum::response::Html as HtmlResponse;
use axum::response::IntoResponse;
use axum::response::Json as JsonResponse;
use http::{Response, StatusCode};

pub type HandlerResult<T> = Result<T, HandlerError>;

#[derive(Debug, Error)]
pub enum HandlerError {
    #[error(transparent)]
    Other(#[from] Error),
}

impl IntoResponse for HandlerError {
    type Body = Full<Bytes>;
    type BodyError = Infallible;

    fn into_response(self) -> Response<Self::Body> {
        use HandlerError::*;
        let (status_code, message) = match self {
            Other(error) => {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("{:#}", &error))
            }
        };
        let body = json!({
            "statusCode": status_code.as_u16(),
            "errors": [{ "message": message }]
        });
        let body = JsonResponse(body);
        (status_code, body).into_response()
    }
}
