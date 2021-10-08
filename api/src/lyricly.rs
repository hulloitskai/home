use http::StatusCode;

use super::prelude::*;

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Client {
    http: HttpClient,

    #[derivative(Debug = "ignore")]
    lyrics_cache: AsyncMutex<Cache<LyricsKey, Lyrics>>,
}

#[derive(Debug, Clone, Hash, PartialOrd, Ord, PartialEq, Eq)]
struct LyricsKey {
    track_name: String,
    artist_name: String,
}

impl Client {
    pub fn new() -> Self {
        Self {
            http: default(),
            lyrics_cache: {
                let capacity = 1000;
                let ttl = Duration::hours(1).to_std().unwrap();
                let cache =
                    Cache::with_expiry_duration_and_capacity(ttl, capacity);
                cache.into()
            },
        }
    }
}

impl Default for Client {
    fn default() -> Self {
        Self::new()
    }
}

impl Client {
    pub async fn get_lyrics(
        &self,
        track_name: &str,
        artist_name: &str,
    ) -> Result<Option<Lyrics>> {
        let mut cache = self.lyrics_cache.lock().await;

        // Try to load lyrics from cache.
        let key = LyricsKey {
            track_name: track_name.to_owned(),
            artist_name: artist_name.to_owned(),
        };
        if let Some(lyrics) = cache.get(&key) {
            trace!(
                target: "home-api::lyricly",
                artist = artist_name,
                track = track_name,
                "got lyrics from cache",
            );
            return Ok(Some(lyrics.to_owned()));
        }

        // Fetch new lyrics.
        let url = {
            let mut url: Url = "https://lyricly.azurewebsites.net/api/lyrics"
                .parse()
                .unwrap();
            {
                let mut query = url.query_pairs_mut();
                query.append_pair("id", "0");
                query.append_pair("length", "0");
                query.append_pair("title", track_name);
                query.append_pair("artist", artist_name);
            }
            url
        };
        let response = {
            let response =
                self.http.get(url).send().await.context("request failed")?;
            if response.status() == StatusCode::NOT_FOUND {
                return Ok(None);
            }
            response.error_for_status().context("bad status")?
        };
        let lyrics = {
            let lyrics: Lyrics = response
                .json()
                .await
                .context("failed to decode JSON response")?;
            debug!(
                target: "home-api::lyricly",
                artist = artist_name,
                track = track_name,
                "got lyrics",
            );
            cache.insert(key, lyrics.clone());
            lyrics
        };
        Ok(Some(lyrics))
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct Lyrics {
    #[serde(alias = "synced")]
    pub lines: Option<Vec<LyricLine>>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LyricLine {
    #[serde(alias = "line")]
    pub text: String,

    #[serde(alias = "milliseconds")]
    pub position: u32,
}
