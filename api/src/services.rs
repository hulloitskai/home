pub mod auth0;
pub mod lyricly;
pub mod obsidian;
pub mod segment;
pub mod spotify;

pub use self::segment::Service as SegmentService;
pub use self::segment::ServiceConfig as SegmentServiceConfig;
pub use auth0::Service as Auth0Service;
pub use auth0::ServiceConfig as Auth0ServiceConfig;
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
    pub segment: SegmentService,
    pub spotify: SpotifyService,
    pub lyricly: LyriclyService,
    pub auth0: Auth0Service,
}

#[derive(Debug, Builder)]
struct ServicesInner {
    database: Database,
    database_client: DatabaseClient,
    settings: Settings,
    obsidian: ObsidianService,
    segment: SegmentService,
    spotify: SpotifyService,
    lyricly: LyriclyService,
    auth0: Auth0Service,
}

impl ServicesInner {
    fn database(&self) -> &Database {
        &self.database
    }

    fn database_client(&self) -> &DatabaseClient {
        &self.database_client
    }

    fn settings(&self) -> &Settings {
        &self.settings
    }

    fn obsidian(&self) -> &ObsidianService {
        &self.obsidian
    }

    fn segment(&self) -> &SegmentService {
        &self.segment
    }

    fn spotify(&self) -> &SpotifyService {
        &self.spotify
    }

    fn lyricly(&self) -> &LyriclyService {
        &self.lyricly
    }

    fn auth0(&self) -> &Auth0Service {
        &self.auth0
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
            segment,
            spotify,
            lyricly,
            auth0,
        } = config;

        let inner = ServicesInner {
            database,
            database_client,
            settings,
            obsidian,
            segment,
            spotify,
            lyricly,
            auth0,
        };
        Services(inner.into())
    }

    delegate! {
        to self.0 {
            pub fn database(&self) -> &Database;
            pub fn database_client(&self) -> &DatabaseClient;
            pub fn settings(&self) -> &Settings;
            pub fn obsidian(&self) -> &ObsidianService;
            pub fn segment(&self) -> &SegmentService;
            pub fn spotify(&self) -> &SpotifyService;
            pub fn lyricly(&self) -> &LyriclyService;
            pub fn auth0(&self) -> &Auth0Service;
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
    pub api_base_url: Url,
    pub api_public_base_url: Url,
    pub web_base_url: Url,
    pub web_public_base_url: Url,
}
