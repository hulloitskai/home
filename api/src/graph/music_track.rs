use super::*;

use services::lyricly::Lyrics as LyriclyLyrics;
use services::spotify::Track as SpotifyTrack;

#[derive(Debug, Clone, From)]
pub(super) struct MusicTrackObject(SpotifyTrack);

#[Object(name = "MusicTrack")]
impl MusicTrackObject {
    async fn spotify_id(&self) -> &str {
        let MusicTrackObject(track) = self;
        track.id.as_str()
    }

    async fn spotify_url(&self) -> FieldResult<Url> {
        self.resolve_spotify_url().await.map_err(format_error)
    }

    async fn name(&self) -> &str {
        let MusicTrackObject(track) = self;
        track.name.as_str()
    }

    async fn duration(&self) -> u32 {
        let MusicTrackObject(track) = self;
        track.duration
    }

    async fn album(&self) -> MusicAlbumObject {
        let MusicTrackObject(track) = self;
        track.album.clone().into()
    }

    async fn artists(&self) -> Vec<MusicArtistObject> {
        let MusicTrackObject(track) = self;
        track.artists.iter().cloned().map(Into::into).collect()
    }

    async fn lyrics(&self, ctx: &Context<'_>) -> FieldResult<Option<Lyrics>> {
        self.resolve_lyrics(ctx).await.map_err(format_error)
    }
}

impl MusicTrackObject {
    async fn resolve_spotify_url(&self) -> Result<Url> {
        let MusicTrackObject(track) = self;
        let url: Url = track
            .external_urls
            .spotify
            .parse()
            .context("failed to parse URL")?;
        Ok(url)
    }

    async fn resolve_lyrics(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Option<Lyrics>> {
        let MusicTrackObject(track) = self;
        let artist = match track.artists.first() {
            Some(artist) => artist,
            None => return Ok(None),
        };
        let lyrics = ctx
            .services()
            .lyricly()
            .get_lyrics(&track.name, &artist.name)
            .await?;
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
