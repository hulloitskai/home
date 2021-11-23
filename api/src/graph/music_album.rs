use super::*;

use services::spotify::Album as SpotifyAlbum;
use services::spotify::Image as SpotifyImage;

#[derive(Debug, Clone, From)]
pub(super) struct MusicAlbumObject(SpotifyAlbum);

#[Object(name = "MusicAlbum")]
impl MusicAlbumObject {
    async fn spotify_id(&self) -> &str {
        let MusicAlbumObject(album) = self;
        album.id.as_str()
    }

    async fn spotify_url(&self) -> FieldResult<Url> {
        self.resolve_spotify_url().await.map_err(format_error)
    }

    async fn name(&self) -> &str {
        let MusicAlbumObject(album) = self;
        album.name.as_str()
    }

    async fn image_url(&self) -> FieldResult<Url> {
        self.resolve_image_url().await.map_err(format_error)
    }
}

impl MusicAlbumObject {
    async fn resolve_spotify_url(&self) -> Result<Url> {
        let MusicAlbumObject(album) = self;
        let url: Url = album
            .external_urls
            .spotify
            .parse()
            .context("failed to parse URL")?;
        Ok(url)
    }

    async fn resolve_image_url(&self) -> Result<Url> {
        let MusicAlbumObject(album) = self;
        let image = album.images.first().context("missing album image")?;
        let url: Url = image.url.parse().context("failed to parse URL")?;
        Ok(url)
    }
}
