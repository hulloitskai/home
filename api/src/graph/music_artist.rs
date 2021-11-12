use super::*;

use services::spotify::Artist as SpotifyArtist;

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct MusicArtist {
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
