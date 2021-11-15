mod mutation;
mod query;
mod subscription;

pub use mutation::*;
pub use query::*;
pub use subscription::*;

mod build;
mod date_time;
mod form;
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
mod test;
mod user;

use build::*;
use date_time::*;
use form::*;
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
use test::*;
use user::*;

use super::*;

use services::auth0::Identity;
use services::Services;

use entrust::{Comparison, Record, SortingDirection};
use entrust::{Entity, EntityId};

use graphql::scalar;
use graphql::Context;
use graphql::Value;
use graphql::{Enum, EnumType};
use graphql::{FieldError, FieldResult};
use graphql::{InputObject, InputObjectType};
use graphql::{InputValueError, InputValueResult};
use graphql::{Interface, InterfaceType};
use graphql::{MergedObject, Object, ObjectType, SimpleObject};
use graphql::{MergedSubscription, Subscription, SubscriptionType};
use graphql::{Scalar, ScalarType};
use graphql::{Union, UnionType};

use entities::{Context as EntityContext, *};

trait ContextExt {
    fn services(&self) -> &Services;

    fn identity(&self) -> Option<&Identity>;

    // async fn transact<F, T, U>(&self, f: F) -> FieldResult<T>
    // where
    //     F: Send,
    //     F: FnOnce(EntityContext) -> U,
    //     T: Send,
    //     U: Send,
    //     U: Future<Output = Result<T>>,
    // {
    //     let services = self.services();
    //     let ctx = EntityContext::new(services);
    //     ctx.transact(f).await.into_field_result()
    // }
}

impl<'a> ContextExt for Context<'a> {
    fn services(&self) -> &Services {
        self.data_unchecked::<Services>()
    }

    fn identity(&self) -> Option<&Identity> {
        self.data_opt()
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
