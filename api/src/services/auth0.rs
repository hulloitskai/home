use super::*;

use entities::Email;

#[derive(Debug, Clone, Hash, Serialize, Deserialize)]
pub struct UserInfo {
    pub id: String,
    pub email: Email,
    pub is_admin: bool,
}

#[derive(Debug, Deserialize)]
struct Claims {
    sub: String,

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
    cache: Cache<String, UserInfo>,
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
    pub async fn userinfo(&self, token: &str) -> Result<UserInfo> {
        let Self {
            client,
            issuer_base_url,
            cache,
        } = self;

        let token = token.to_owned();
        if let Some(claims) = cache.get(&token) {
            trace!(?claims, "cache hit");
            return Ok(claims);
        } else {
            trace!("cache miss");
        };

        let url = {
            let mut url = issuer_base_url.clone();
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
        let response = response.error_for_status().context("bad status")?;

        let data = response
            .json::<Json>()
            .await
            .context("failed to decode JSON response")?;
        println!("data: {:?}", &data);
        let identity = match from_json::<Claims>(data.clone()) {
            Ok(claims) => {
                let identity = {
                    let Claims {
                        sub,
                        email,
                        is_admin,
                    } = claims;
                    UserInfo {
                        id: sub,
                        email,
                        is_admin,
                    }
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
