#![allow(dead_code)]

mod services;
pub use services::*;

mod context;
pub use context::*;

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
