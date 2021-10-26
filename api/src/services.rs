use entrust::EntityServices;
use entrust::{Database, DatabaseClient};

use super::*;

use lyricly::Client as LyriclyClient;
use obsidian::Client as ObsidianClient;
use spotify::Client as SpotifyClient;

#[derive(Debug, Builder)]
pub struct Config {
    pub database: Database,
    pub database_client: DatabaseClient,
    pub settings: Settings,
    pub obsidian: ObsidianClient,
    pub spotify: SpotifyClient,
    pub lyricly: LyriclyClient,
}

#[derive(Debug, Builder)]
struct ServicesInner {
    database: Database,
    database_client: DatabaseClient,
    settings: Settings,
    obsidian: ObsidianClient,
    spotify: SpotifyClient,
    lyricly: LyriclyClient,
}

impl ServicesInner {
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

#[derive(Debug, Clone)]
pub struct Services(Arc<ServicesInner>);

impl Services {
    pub fn new(config: Config) -> Self {
        let Config {
            database,
            database_client,
            settings,
            obsidian,
            spotify,
            lyricly,
        } = config;

        let inner = ServicesInner {
            database,
            database_client,
            settings,
            obsidian,
            spotify,
            lyricly,
        };
        Services(inner.into())
    }

    delegate! {
        to self.0 {
            pub fn database(&self) -> &Database;
            pub fn database_client(&self) -> &DatabaseClient;
            pub fn settings(&self) -> &Settings;
            pub fn obsidian(&self) -> &ObsidianClient;
            pub fn spotify(&self) -> &SpotifyClient;
            pub fn lyricly(&self) -> &LyriclyClient;
        }
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

#[derive(Debug, Clone, Builder)]
pub struct Settings {
    pub web_public_url: Url,
    pub api_public_url: Url,
}
