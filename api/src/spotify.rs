use super::*;

use auth::AccessToken;
use auth::{Authenticator, AuthenticatorConfig};

use http::StatusCode;

#[derive(Debug, Clone, Builder)]
pub struct ClientConfig {
    pub client_id: String,
    pub client_secret: String,
    pub refresh_token: String,

    #[builder(default = Duration::milliseconds(500))]
    pub ttl: Duration,
}

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Client {
    http: HttpClient,
    auth: Authenticator,

    #[derivative(Debug = "ignore")]
    cache: AsyncMutex<Cache<CurrentlyPlayingKey, Option<CurrentlyPlaying>>>,
}

#[derive(Debug, Clone, Copy, Hash, PartialOrd, Ord, PartialEq, Eq)]
pub struct CurrentlyPlayingKey;

impl Client {
    pub fn new(config: ClientConfig) -> Self {
        let ClientConfig {
            client_id,
            client_secret,
            refresh_token,
            ttl,
        } = config;
        let auth = {
            let token_endpoint: Url =
                "https://accounts.spotify.com/api/token".parse().unwrap();
            let config = AuthenticatorConfig::builder()
                .client_id(client_id)
                .client_secret(client_secret)
                .token_endpoint(token_endpoint)
                .refresh_token(refresh_token)
                .build();
            Authenticator::new(config)
        };
        Self {
            http: default(),
            auth,
            cache: {
                let cache = Cache::with_expiry_duration(ttl.to_std().unwrap());
                cache.into()
            },
        }
    }
}

impl Client {
    pub async fn get_currently_playing(
        &self,
    ) -> Result<Option<CurrentlyPlaying>> {
        let mut cache = self.cache.lock().await;

        // Try to load currently playing from cache.
        if let Some(currently_playing) = cache.get(&CurrentlyPlayingKey) {
            let (artist_name, track_name) = match currently_playing {
                Some(CurrentlyPlaying { track, .. }) => {
                    let artist = track.artists.first();
                    (
                        artist.map(|artist| artist.name.as_str()),
                        Some(track.name.as_str()),
                    )
                }
                None => (None, None),
            };
            trace!(
                target: "home-api::spotify",
                artist = %artist_name.unwrap_or_default(),
                track = %track_name.unwrap_or_default(),
                "got currently-playing from cache",
            );
            return Ok(currently_playing.to_owned());
        }

        // Fetch new currently playing data.
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
            let AccessToken { token, .. } = self
                .auth
                .access_token()
                .await
                .context("failed to get access token")?;
            self.http.get(url).bearer_auth(token)
        };
        let response = {
            let response = request.send().await.context("request failed")?;
            response.error_for_status().context("bad status")?
        };
        let currently_playing = {
            let currently_playing = match response.status() {
                StatusCode::NO_CONTENT => None,
                _ => {
                    let current_playing: CurrentlyPlaying = response
                        .json()
                        .await
                        .context("failed to decode JSON response")?;
                    Some(current_playing)
                }
            };
            if let Some(CurrentlyPlaying { track, .. }) = &currently_playing {
                let artist = track.artists.first();
                if let Some(artist) = artist {
                    debug!(
                        target: "home-api::spotify",
                        artist = %artist.name,
                        track = %track.name,
                        "got currently-playing",
                    );
                };
            } else {
                trace!(
                    target: "home-api::spotify",
                    "got currently-playing (none)",
                );
            }
            cache.insert(CurrentlyPlayingKey, currently_playing.clone());
            currently_playing
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
