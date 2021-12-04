#![allow(unused_imports)]

pub mod auth;
pub mod config;
pub mod entities;
pub mod graph;
pub mod handlers;
pub mod services;
pub mod util;

use util::*;

use std::collections::HashMap as Map;
use std::collections::HashSet as Set;
use std::convert::{Infallible, TryFrom, TryInto};
use std::fmt::{Debug, Display};
use std::hash::Hash;
use std::iter::FromIterator;
use std::ops::Deref;
use std::pin::Pin;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration as StdDuration;

use derives::Display;
use derives::{AsMut, AsRef, Deref, DerefMut};
use derives::{Constructor, IsVariant};
use derives::{From, FromStr, Into, TryInto};

use futures::{Future, Stream, TryFuture, TryStream};
use futures_util::future::try_join_all;
use futures_util::future::{FutureExt, TryFutureExt};
use futures_util::stream::{StreamExt, TryStreamExt};

use tokio::sync::Mutex as AsyncMutex;
use tokio::sync::RwLock as AsyncRwLock;
use tokio::sync::Semaphore;
use tokio::task::{spawn, spawn_blocking};

use anyhow::Context as AnyhowContext;
use anyhow::{bail, ensure};
use anyhow::{Error, Result};

use serde::de::Error as DeserializeError;
use serde::ser::Error as SerializeError;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde_json::from_str as from_json_str;
use serde_json::from_value as from_json;
use serde_json::json;
use serde_json::to_string as to_json_string;
use serde_json::to_value as to_json;
use serde_json::Value as Json;

use chrono::NaiveDate as Date;
use chrono::NaiveTime as Time;
use chrono::{Duration, FixedOffset, TimeZone, Utc};

type DateTime<Tz = Utc> = chrono::DateTime<Tz>;

use cache::{Cache, CacheBuilder};
use moka::future as cache;

use async_trait::async_trait;
use delegate::delegate;
use derivative::Derivative;
use lazy_static::lazy_static;
use regex::Regex;
use request::Client as HttpClient;
use thiserror::Error;
use tracing::{debug, error, info, trace, warn};
use typed_builder::TypedBuilder as Builder;
use url::Url;

trait CacheExt<K, V> {
    fn builder(max_capacity: usize) -> CacheBuilder<Cache<K, V>>;
}

impl<K, V> CacheExt<K, V> for Cache<K, V>
where
    K: Send + Sync + 'static,
    V: Send + Sync + 'static,
    K: Eq + Hash,
    V: Clone,
{
    fn builder(max_capacity: usize) -> CacheBuilder<Cache<K, V>> {
        CacheBuilder::new(max_capacity)
    }
}
