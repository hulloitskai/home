mod prelude;

mod build;
mod date;
mod date_time;
mod heart_rate;
mod id;
mod knowledge_entry;
mod knowledge_entry_links;
mod lyric_line;
mod lyrics;
mod music_album;
mod music_artist;
mod music_info;
mod music_track;
mod mutation;
mod query;

use build::*;
// use date::*
use date_time::*;
use heart_rate::*;
use id::*;
use knowledge_entry::*;
use knowledge_entry_links::*;
use lyric_line::*;
use lyrics::*;
use music_album::*;
use music_artist::*;
use music_info::*;
use music_track::*;

pub use mutation::*;
pub use query::*;

use prelude::*;

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
