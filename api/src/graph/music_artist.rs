use super::*;

use services::spotify::Artist as SpotifyArtist;

#[derive(Debug, Clone, From)]
pub(super) struct MusicArtistObject(SpotifyArtist);

#[Object(name = "MusicArtist")]
impl MusicArtistObject {
    async fn spotify_id(&self) -> &str {
        let MusicArtistObject(artist) = self;
        artist.id.as_str()
    }

    async fn spotify_url(&self) -> FieldResult<Url> {
        self.resolve_spotify_url().await.map_err(format_error)
    }

    async fn name(&self) -> &str {
        let MusicArtistObject(artist) = self;
        artist.name.as_str()
    }
}

impl MusicArtistObject {
    async fn resolve_spotify_url(&self) -> Result<Url> {
        let MusicArtistObject(artist) = self;
        let url: Url = artist
            .external_urls
            .spotify
            .parse()
            .context("failed to parse URL")?;
        Ok(url)
    }
}
