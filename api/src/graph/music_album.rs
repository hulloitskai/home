use super::*;

use services::spotify::Album as SpotifyAlbum;
use services::spotify::Image as SpotifyImage;

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct MusicAlbum {
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
