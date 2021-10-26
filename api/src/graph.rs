mod build;
use build::*;

mod date_time;
use date_time::*;

mod heart_rate;
use heart_rate::*;

mod id;
use id::*;

mod knowledge_entry;
use knowledge_entry::*;

mod knowledge_entry_links;
use knowledge_entry_links::*;

mod lyric_line;
use lyric_line::*;

mod lyrics;
use lyrics::*;

mod music_album;
use music_album::*;

mod music_artist;
use music_artist::*;

mod music_track;
use music_track::*;

mod music_info;
use music_info::*;

mod query;
pub use query::*;

mod mutation;
pub use mutation::*;

use super::*;

use entities::{Context as EntityContext, *};

use entrust::{Comparison, Record, SortingDirection};
use entrust::{Entity, EntityId};

use graphql::scalar;
use graphql::Value;
use graphql::{Context, FieldError, FieldResult};
use graphql::{InputValueError, InputValueResult};
use graphql::{MergedObject, Object, SimpleObject};
use graphql::{Scalar, ScalarType};

#[async_trait]
pub(super) trait ContextExt {
    fn entity(&self) -> &EntityContext;

    fn services(&self) -> &Services {
        self.entity().services()
    }

    async fn transact<F, T, U>(&self, f: F) -> FieldResult<T>
    where
        F: Send,
        F: FnOnce(EntityContext) -> U,
        T: Send,
        U: Send,
        U: Future<Output = Result<T>>,
    {
        self.entity().transact(f).await.into_field_result()
    }
}

impl<'a> ContextExt for Context<'a> {
    fn entity(&self) -> &EntityContext {
        self.data_unchecked()
    }
}

pub(super) trait ResultExt<T> {
    fn into_field_result(self) -> FieldResult<T>;
}

impl<T, E> ResultExt<T> for Result<T, E>
where
    Result<T, E>: AnyhowContext<T, E>,
    E: Display,
{
    fn into_field_result(self) -> FieldResult<T> {
        self.map_err(|error| FieldError::new(format!("{:#}", error)))
    }
}
