use super::*;

use oauth2::basic::BasicClient as Client;
use oauth2::reqwest::async_http_client;
use oauth2::{AuthUrl, TokenUrl};
use oauth2::{ClientId, ClientSecret};
use oauth2::{RefreshToken, TokenResponse};

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct AuthenticatorConfig {
    pub client_id: String,
    pub client_secret: String,
    pub token_endpoint: Url,
    pub refresh_token: String,
}

#[derive(Debug)]
pub struct Authenticator {
    client: Client,
    refresh_token: String,
    current_access_token: AsyncMutex<Option<AccessToken>>,
    clock_skew_leeway: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessToken {
    pub token: String,
    pub expires_at: Option<DateTime>,
}

impl Authenticator {
    pub fn new(config: AuthenticatorConfig) -> Self {
        let AuthenticatorConfig {
            client_id,
            client_secret,
            token_endpoint,
            refresh_token,
        } = config;
        let client_id = ClientId::new(client_id);
        let client_secret = ClientSecret::new(client_secret);
        let auth_url = AuthUrl::new("https://example.com".to_owned()).unwrap();
        let token_url = TokenUrl::new(token_endpoint.to_string()).unwrap();
        let client = Client::new(
            client_id,
            Some(client_secret),
            auth_url,
            Some(token_url),
        );
        Self {
            client,
            refresh_token,
            current_access_token: default(),
            clock_skew_leeway: Duration::seconds(60),
        }
    }

    pub async fn access_token(&self) -> Result<AccessToken> {
        let mut current_access_token = self.current_access_token.lock().await;

        if let Some(token) = current_access_token.as_ref() {
            let AccessToken { expires_at, .. } = token;
            let is_valid = match expires_at {
                Some(expires_at) => {
                    let expires_at = (*expires_at) - self.clock_skew_leeway;
                    now() < expires_at
                }
                None => true,
            };
            if is_valid {
                return Ok(token.clone());
            }
        }

        let token = {
            let response = {
                let refresh_token =
                    RefreshToken::new(self.refresh_token.clone());
                self.client
                    .exchange_refresh_token(&refresh_token)
                    .request_async(async_http_client)
                    .await?
            };
            let token = {
                let token = response.access_token().secret().to_owned();
                let expires_at = response.expires_in().map(|expires_in| {
                    let expires_in = Duration::from_std(expires_in).unwrap();
                    now() + expires_in
                });
                AccessToken { token, expires_at }
            };
            current_access_token.insert(token).clone()
        };

        Ok(token)
    }
}
