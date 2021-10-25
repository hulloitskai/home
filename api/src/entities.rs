#![allow(dead_code)]

mod build;
pub use build::*;

mod email;
pub use email::*;

mod phone;
pub use phone::*;

mod heart_rate;
pub use heart_rate::*;

mod knowledge_entry;
pub use knowledge_entry::*;

use super::*;

use lyricly::Client as LyriclyClient;
use obsidian::Client as ObsidianClient;
use spotify::Client as SpotifyClient;

use entrust::{Comparison, SortingDirection};
use entrust::{Database, DatabaseClient};
use entrust::{EmptyConditions, EntityConditions};
use entrust::{EmptySorting, EntitySorting};
use entrust::{Entity, EntityContext, EntityId, EntityServices};
use entrust::{Object, ObjectId};

use ::bson::DateTime as BsonDateTime;
use ::bson::{doc, from_document, to_document};
use ::bson::{Bson, Document};

fn to_date_time(date: Date) -> DateTime {
    let time = Time::from_hms(0, 0, 0);
    let date_time = date.and_time(time);
    Utc.from_utc_datetime(&date_time)
}

fn from_date_time(date_time: DateTime) -> Date {
    let date = date_time.naive_utc().date();
    date.into()
}

#[derive(Debug, Builder)]
pub struct Services {
    database: Database,
    database_client: DatabaseClient,
    settings: Settings,
    obsidian: ObsidianClient,
    spotify: SpotifyClient,
    lyricly: LyriclyClient,
}

#[derive(Debug, Clone, Builder)]
pub struct Settings {
    pub web_public_url: Url,
    pub api_public_url: Url,
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

pub type Context<T = Services> = EntityContext<T>;
