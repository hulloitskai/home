use super::*;

use entities::Email;

#[derive(Debug, Clone, Hash, Serialize, Deserialize)]
pub struct Identity {
    pub email: Email,
    pub is_admin: bool,
}

#[derive(Debug, Deserialize)]
struct Claims {
    email: Email,

    #[serde(rename(deserialize = "https://itskai.me/is_admin"))]
    is_admin: bool,
}

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Service {
    client: HttpClient,
    issuer_base_url: Url,

    #[derivative(Debug = "ignore")]
    cache: Cache<String, Identity>,
}

#[derive(Debug, Clone, Builder)]
pub struct ServiceConfig {
    issuer_base_url: Url,
}

impl Service {
    pub fn new(config: ServiceConfig) -> Self {
        let ServiceConfig { issuer_base_url } = config;
        Service {
            client: default(),
            issuer_base_url,
            cache: Cache::new(1000),
        }
    }
}

impl Service {
    pub async fn identify(&self, token: &str) -> Result<Identity> {
        let Self {
            client,
            issuer_base_url,
            cache,
        } = self;

        let token = token.to_owned();
        if let Some(claims) = cache.get(&token) {
            trace!("cache hit");
            return Ok(claims);
        } else {
            trace!("cache miss");
        };

        let url = {
            let mut url = issuer_base_url.to_owned();
            {
                let mut segments = url.path_segments_mut().unwrap();
                segments.push("userinfo");
            }
            url
        };
        let response = client
            .get(url)
            .bearer_auth(&token)
            .send()
            .await
            .context("request failed")?;

        let data = response
            .json::<Json>()
            .await
            .context("failed to decode JSON response")?;
        let identity = match from_json::<Claims>(data.clone()) {
            Ok(claims) => {
                let identity = {
                    let Claims { email, is_admin } = claims;
                    Identity { email, is_admin }
                };
                self.cache.insert(token.clone(), identity.clone()).await;
                identity
            }
            Err(error) => {
                error!(%data, "unexpected response");
                return Err(error).context("failed to parse claims");
            }
        };
        Ok(identity)
    }
}
