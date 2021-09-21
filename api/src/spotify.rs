use super::prelude::*;

use http::StatusCode;

use oauth2::basic::BasicClient as AuthClient;
use oauth2::reqwest::async_http_client;
use oauth2::{AuthUrl, TokenUrl};
use oauth2::{ClientId, ClientSecret};
use oauth2::{RefreshToken, TokenResponse};

#[derive(Debug, Clone)]
pub struct Client {
    http: HttpClient,
    auth: AuthClient,
    token: String,
}

impl Client {
    pub fn new(client_id: &str, client_secret: &str, token: &str) -> Self {
        let auth = {
            let client_id = ClientId::new(client_id.to_owned());
            let client_secret = ClientSecret::new(client_secret.to_owned());
            let auth_url = AuthUrl::new(
                "https://accounts.spotify.com/authorize".to_owned(),
            )
            .unwrap();
            let token_url = TokenUrl::new(
                "https://accounts.spotify.com/api/token".to_owned(),
            )
            .unwrap();
            AuthClient::new(
                client_id,
                client_secret.into(),
                auth_url,
                token_url.into(),
            )
        };
        Self {
            http: default(),
            auth,
            token: token.to_owned(),
        }
    }
}

impl Client {
    pub async fn get_currently_playing(
        &self,
    ) -> Result<Option<CurrentlyPlaying>> {
        let url = {
            let url = format!(
                "https://api.spotify.com/v1/me/player/currently-playing"
            );
            let mut url: Url = url.parse().unwrap();
            {
                let mut query = url.query_pairs_mut();
                query.append_pair("market", "CA");
            }
            url
        };
        let request = {
            let token_response = {
                let refresh_token = RefreshToken::new(self.token.clone());
                self.auth
                    .exchange_refresh_token(&refresh_token)
                    .request_async(async_http_client)
                    .await
                    .context("failed to exchange refresh token")?
            };
            let token = token_response.access_token().secret();
            self.http.get(url).bearer_auth(token)
        };
        let response = {
            let response = request.send().await.context("request failed")?;
            response.error_for_status().context("bad status")?
        };
        let currently_playing = match response.status() {
            StatusCode::NO_CONTENT => None,
            _ => response
                .json()
                .await
                .context("failed to decode JSON response")?,
        };
        Ok(currently_playing)
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct CurrentlyPlaying {
    pub is_playing: bool,

    #[serde(alias = "item")]
    pub track: Track,

    #[serde(alias = "progress_ms")]
    pub progress: u32,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Track {
    pub id: String,
    pub external_urls: ExternalURLs,
    pub name: String,
    #[serde(alias = "duration_ms")]
    pub duration: u32,
    pub album: Album,
    pub artists: Vec<Artist>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ExternalURLs {
    pub spotify: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Album {
    pub id: String,
    pub external_urls: ExternalURLs,
    pub name: String,
    pub images: Vec<Image>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Artist {
    pub id: String,
    pub external_urls: ExternalURLs,
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Image {
    pub url: String,
    pub width: u32,
    pub height: u32,
}
