use super::*;

use crate::lyricly::Lyrics as LyriclyLyrics;
use crate::spotify::Track as SpotifyTrack;

#[derive(Debug, Clone)]
pub(super) struct MusicTrack {
    pub spotify_id: String,
    pub spotify_url: String,
    pub name: String,
    pub duration: u32,
    pub album: MusicAlbum,
    pub artists: Vec<MusicArtist>,
}

#[Object]
impl MusicTrack {
    async fn spotify_id(&self) -> &String {
        &self.spotify_id
    }

    async fn spotify_url(&self) -> &String {
        &self.spotify_url
    }

    async fn name(&self) -> &String {
        &self.name
    }

    async fn duration(&self) -> u32 {
        self.duration
    }

    async fn album(&self) -> &MusicAlbum {
        &self.album
    }

    async fn artists(&self) -> &Vec<MusicArtist> {
        &self.artists
    }

    async fn lyrics(&self, ctx: &Context<'_>) -> FieldResult<Option<Lyrics>> {
        let artist = match self.artists.first() {
            Some(artist) => artist,
            None => return Ok(None),
        };
        let lyrics = ctx
            .services()
            .lyricly()
            .get_lyrics(&self.name, &artist.name)
            .await
            .into_field_result()?;
        let lyrics = lyrics
            .map(|lyrics| {
                let LyriclyLyrics { lines } = &lyrics;
                if lines.is_some() {
                    Some(Lyrics::from(lyrics))
                } else {
                    None
                }
            })
            .flatten();
        Ok(lyrics)
    }
}

impl TryFrom<SpotifyTrack> for MusicTrack {
    type Error = Error;

    fn try_from(track: SpotifyTrack) -> Result<Self, Self::Error> {
        let SpotifyTrack {
            id: spotify_id,
            external_urls,
            name,
            duration,
            album,
            artists,
        } = track;
        let album: MusicAlbum = album.try_into().context("invalid album")?;
        let artists = artists.into_iter().map(MusicArtist::from).collect();

        let track = Self {
            spotify_id,
            spotify_url: external_urls.spotify,
            name,
            duration,
            album,
            artists,
        };
        Ok(track)
    }
}
