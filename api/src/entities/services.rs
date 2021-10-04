use super::prelude::*;

#[derive(Debug, Builder)]
pub struct Services {
    pub database: Database,
    pub database_client: DatabaseClient,
    pub obsidian: ObsidianClient,
    pub spotify: SpotifyClient,
    pub lyricly: LyriclyClient,
}
