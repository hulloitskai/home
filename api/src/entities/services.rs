use super::prelude::*;

#[derive(Debug, Builder)]
pub struct Services {
    database: Database,
    database_client: DatabaseClient,
    settings: Settings,
    obsidian: ObsidianClient,
    spotify: SpotifyClient,
    lyricly: LyriclyClient,
}

impl Services {
    pub fn database(&self) -> &Database {
        &self.database
    }

    pub fn database_client(&self) -> &DatabaseClient {
        &self.database_client
    }

    pub fn settings(&self) -> &Settings {
        &self.settings
    }

    pub fn obsidian(&self) -> &ObsidianClient {
        &self.obsidian
    }

    pub fn spotify(&self) -> &SpotifyClient {
        &self.spotify
    }

    pub fn lyricly(&self) -> &LyriclyClient {
        &self.lyricly
    }
}

impl EntityServices for Services {
    fn database(&self) -> &Database {
        self.database()
    }

    fn database_client(&self) -> &DatabaseClient {
        self.database_client()
    }
}
