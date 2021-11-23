mod mutation;
mod query;
mod subscription;

pub use mutation::*;
pub use query::*;
pub use subscription::*;

mod build;
mod date_time;
mod form;
mod form_response;
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
use form_response::*;
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
}

impl<'a> ContextExt for Context<'a> {
    fn services(&self) -> &Services {
        self.data_unchecked::<Services>()
    }

    fn identity(&self) -> Option<&Identity> {
        self.data_opt()
    }
}

fn format_error(error: Error) -> FieldError {
    FieldError::new(format!("{:#}", error))
}
