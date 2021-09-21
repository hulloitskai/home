use super::prelude::*;

use crate::spotify::Album as SpotifyAlbum;
use crate::spotify::Artist as SpotifyArtist;
use crate::spotify::CurrentlyPlaying;
use crate::spotify::Image as SpotifyImage;
use crate::spotify::Track as SpotifyTrack;

use crate::lyricly::LyricLine as LyriclyLyricLine;
use crate::lyricly::Lyrics as LyriclyLyrics;

#[derive(Debug, Clone, SimpleObject)]
pub struct MusicInfo {
    pub is_playing: bool,
    pub track: MusicTrack,
    pub progress: u32,
}

#[derive(Debug, Clone)]
pub struct MusicTrack {
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
        let Services { lyricly, .. } = ctx.entity().services();
        let artist = match self.artists.first() {
            Some(artist) => artist,
            None => return Ok(None),
        };
        let lyrics = lyricly
            .get_lyrics(&self.name, &artist.name)
            .await
            .into_field_result()?;
        let lyrics = lyrics.map(Lyrics::try_from).transpose()?;
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
        let artists = artists.into_iter().map(Into::into).collect();
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

#[derive(Debug, Clone, SimpleObject)]
pub struct MusicAlbum {
    pub spotify_id: String,
    pub spotify_url: String,
    pub name: String,
    pub image_url: String,
}

impl TryFrom<SpotifyAlbum> for MusicAlbum {
    type Error = Error;

    fn try_from(album: SpotifyAlbum) -> Result<Self, Self::Error> {
        let SpotifyAlbum {
            id: spotify_id,
            external_urls,
            name,
            images,
        } = album;
        let SpotifyImage { url: image_url, .. } =
            images.into_iter().next().context("missing album image")?;
        let album = Self {
            spotify_id,
            spotify_url: external_urls.spotify,
            name,
            image_url,
        };
        Ok(album)
    }
}

#[derive(Debug, Clone, SimpleObject)]
pub struct MusicArtist {
    pub spotify_id: String,
    pub spotify_url: String,
    pub name: String,
}

impl From<SpotifyArtist> for MusicArtist {
    fn from(artist: SpotifyArtist) -> Self {
        let SpotifyArtist {
            id: spotify_id,
            external_urls,
            name,
        } = artist;
        Self {
            spotify_id,
            spotify_url: external_urls.spotify,
            name,
        }
    }
}

#[derive(Debug, Clone, SimpleObject)]
pub struct Lyrics {
    lines: Vec<LyricLine>,
}

impl TryFrom<LyriclyLyrics> for Lyrics {
    type Error = Error;

    fn try_from(lyrics: LyriclyLyrics) -> Result<Self, Self::Error> {
        let LyriclyLyrics { lines } = lyrics;
        let lines = lines
            .into_iter()
            .map(LyricLine::try_from)
            .collect::<Result<Vec<_>>>()
            .context("invalid lines")?;
        let lyrics = Lyrics { lines };
        Ok(lyrics)
    }
}

#[derive(Debug, Clone, SimpleObject)]
pub struct LyricLine {
    pub text: String,
    pub position: u32,
}

impl TryFrom<LyriclyLyricLine> for LyricLine {
    type Error = Error;

    fn try_from(line: LyriclyLyricLine) -> Result<Self, Self::Error> {
        let LyriclyLyricLine { text, position } = line;
        let position: u32 = position
            .parse()
            .context("failed to parse position as number")?;
        let line = Self { text, position };
        Ok(line)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct MusicQueries;

#[Object]
impl MusicQueries {
    async fn music_info(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<MusicInfo>> {
        let Services { spotify, .. } = ctx.entity().services();
        let currently_playing = spotify
            .get_currently_playing()
            .await
            .context("failed to load currently playing track from Spotify")
            .into_field_result()?;
        let currently_playing = match currently_playing {
            Some(currently_playing) => currently_playing,
            None => return Ok(None),
        };
        let info = {
            let CurrentlyPlaying {
                is_playing,
                track,
                progress,
            } = currently_playing;
            MusicInfo {
                is_playing,
                track: track.try_into().context("invalid track")?,
                progress,
            }
        };
        Ok(info.into())
    }
}
