use super::prelude::*;

use crate::spotify::CurrentlyPlaying;

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct MusicInfo {
    pub is_playing: bool,
    pub track: MusicTrack,
    pub progress: u32,
}

#[derive(Debug, Clone, Copy)]
pub(super) struct MusicInfoQueries;

#[Object]
impl MusicInfoQueries {
    async fn music_info(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<MusicInfo>> {
        let currently_playing = ctx
            .services()
            .spotify()
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
