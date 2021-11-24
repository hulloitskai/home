use super::*;

use graphql::EmptySubscription;

#[derive(Debug, Clone, Copy, Default, MergedSubscription)]
pub struct Subscription(TestSubscription);

impl Subscription {
    pub fn new() -> Self {
        default()
    }
}
