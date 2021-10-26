#![allow(unused_imports)]

pub mod auth;
pub mod entities;
pub mod env;
pub mod graph;
pub mod lyricly;
pub mod obsidian;
pub mod services;
pub mod spotify;

use async_trait::async_trait;
use lazy_static::lazy_static;

use delegate::delegate;
use derivative::Derivative;
use moka::future::{Cache, CacheBuilder};
use regex::Regex;
use request::Client as HttpClient;
use typed_builder::TypedBuilder as Builder;
use url::Url;

use derives::Display;
use derives::{AsRef, Deref};
use derives::{From, Into};

use tokio::sync::Mutex as AsyncMutex;
use tokio::sync::RwLock as AsyncRwLock;
use tokio::sync::Semaphore;
use tokio::task::spawn_blocking;

use std::collections::HashMap as Map;
use std::collections::HashSet as Set;
use std::convert::{TryFrom, TryInto};
use std::fmt::{Debug, Display};
use std::iter::FromIterator;
use std::ops::Deref;
use std::str::FromStr;
use std::sync::Arc;

use serde::{Deserialize, Deserializer, Serialize, Serializer};

use futures::Future;
use futures_util::future::try_join_all;
use futures_util::stream::TryStreamExt;

use anyhow::ensure;
use anyhow::Context as AnyhowContext;
use anyhow::{Error, Result};

use tracing::{debug, trace};

use chrono::DateTime as GenericDateTime;
use chrono::NaiveDate as Date;
use chrono::NaiveTime as Time;
use chrono::{Duration, FixedOffset, TimeZone, Utc};

type DateTime<Tz = Utc> = GenericDateTime<Tz>;

pub fn default<T: Default>() -> T {
    Default::default()
}

pub fn now() -> DateTime {
    Utc::now()
}
