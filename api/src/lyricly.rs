use http::StatusCode;

use super::prelude::*;

#[derive(Debug, Clone, Default)]
pub struct Client {
    pub http: HttpClient,
}

impl Client {
    pub fn new() -> Self {
        default()
    }
}

impl Client {
    pub async fn get_lyrics(
        &self,
        track_name: &str,
        artist_name: &str,
    ) -> Result<Option<Lyrics>> {
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
        let lyrics: Lyrics = response
            .json()
            .await
            .context("failed to decode JSON response")?;
        Ok(lyrics.into())
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct Lyrics {
    #[serde(alias = "synced")]
    pub lines: Vec<LyricLine>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LyricLine {
    #[serde(alias = "line")]
    pub text: String,

    #[serde(alias = "milliseconds")]
    pub position: String,
}
