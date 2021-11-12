use super::*;

use http::StatusCode;

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Service {
    client: HttpClient,

    #[derivative(Debug = "ignore")]
    lyrics_cache: Cache<LyricsKey, Lyrics>,

    #[derivative(Debug = "ignore")]
    lyrics_sem: Semaphore,
}

#[derive(Debug, Clone, Hash, PartialOrd, Ord, PartialEq, Eq)]
struct LyricsKey {
    track_name: String,
    artist_name: String,
}

impl Service {
    pub fn new() -> Self {
        Service {
            client: default(),
            lyrics_cache: Cache::builder(1000)
                .time_to_live(Duration::hours(1).to_std().unwrap())
                .build(),
            lyrics_sem: Semaphore::new(1),
        }
    }
}

impl Default for Service {
    fn default() -> Self {
        Self::new()
    }
}

impl Service {
    pub async fn get_lyrics(
        &self,
        track_name: &str,
        artist_name: &str,
    ) -> Result<Option<Lyrics>> {
        let Self {
            client,
            lyrics_sem: sem,
            lyrics_cache: cache,
            ..
        } = self;

        // Acquire permit.
        let _permit = sem.acquire().await.unwrap();

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
            return Ok(Some(lyrics));
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
                client.get(url).send().await.context("request failed")?;
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
            cache.insert(key, lyrics.clone()).await;
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
