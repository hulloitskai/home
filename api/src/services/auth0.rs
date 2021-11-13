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
}

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Service {
    client: HttpClient,
    domain: String,
    admin_email: Email,

    #[derivative(Debug = "ignore")]
    cache: Cache<String, Identity>,
}

#[derive(Debug, Clone, Builder)]
pub struct ServiceConfig {
    domain: String,
    admin_email: Email,
}

impl Service {
    pub fn new(config: ServiceConfig) -> Self {
        let ServiceConfig {
            admin_email,
            domain,
        } = config;

        Service {
            client: default(),
            domain,
            admin_email,
            cache: Cache::new(1000),
        }
    }
}

impl Service {
    pub async fn identify(&self, token: &str) -> Result<Identity> {
        let Self {
            client,
            domain,
            admin_email,
            cache,
        } = self;

        let token = token.to_owned();
        if let Some(claims) = cache.get(&token) {
            return Ok(claims);
        };

        let url = format!("https://{}/userinfo", domain);
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
                    let Claims { email } = claims;
                    let is_admin = email == *admin_email;
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
