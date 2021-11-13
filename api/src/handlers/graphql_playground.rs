use super::*;

use ::graphql::http::playground_source as graphql_playground_source;
use ::graphql::http::GraphQLPlaygroundConfig;

#[derive(Clone)]
pub struct GraphQLPlaygroundExtension {
    endpoint: Url,
    subscription_endpoint: Url,
}

impl GraphQLPlaygroundExtension {
    pub fn new(services: &Services) -> Result<Self> {
        let endpoint = {
            let mut endpoint = services.settings().api_public_url.clone();
            if !matches!(endpoint.scheme(), "http" | "https") {
                bail!("invalid GraphQL playground endpoint scheme");
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

        let extension = GraphQLPlaygroundExtension {
            endpoint,
            subscription_endpoint,
        };
        Ok(extension)
    }
}

impl GraphQLPlaygroundExtension {
    fn config(&self) -> GraphQLPlaygroundConfig {
        let GraphQLPlaygroundExtension {
            endpoint,
            subscription_endpoint,
        } = self;
        GraphQLPlaygroundConfig::new(endpoint.as_str())
            .subscription_endpoint(subscription_endpoint.as_str())
    }
}

pub async fn graphql_playground_handler(
    Extension(extension): Extension<GraphQLPlaygroundExtension>,
) -> HtmlResponse<String> {
    let config = extension.config();
    let source = graphql_playground_source(config);
    HtmlResponse(source)
}
