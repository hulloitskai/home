pub mod lyricly;
pub mod obsidian;
pub mod spotify;

pub use lyricly::Service as LyriclyService;
pub use obsidian::Service as ObsidianService;
pub use obsidian::ServiceConfig as ObsidianServiceConfig;
pub use spotify::Service as SpotifyService;
pub use spotify::ServiceConfig as SpotifyServiceConfig;

use super::*;

use entrust::EntityServices;
use entrust::{Database, DatabaseClient};

#[derive(Debug, Builder)]
pub struct Config {
    pub database: Database,
    pub database_client: DatabaseClient,
    pub settings: Settings,
    pub obsidian: ObsidianService,
    pub spotify: SpotifyService,
    pub lyricly: LyriclyService,
}

#[derive(Debug, Builder)]
struct ServicesInner {
    database: Database,
    database_client: DatabaseClient,
    settings: Settings,
    obsidian: ObsidianService,
    spotify: SpotifyService,
    lyricly: LyriclyService,
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

    pub fn obsidian(&self) -> &ObsidianService {
        &self.obsidian
    }

    pub fn spotify(&self) -> &SpotifyService {
        &self.spotify
    }

    pub fn lyricly(&self) -> &LyriclyService {
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
            pub fn obsidian(&self) -> &ObsidianService;
            pub fn spotify(&self) -> &SpotifyService;
            pub fn lyricly(&self) -> &LyriclyService;
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
    pub api_secret: String,
}
