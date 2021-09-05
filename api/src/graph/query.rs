use super::prelude::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(BuildQueries, HeartRateQueries);

impl Query {
    pub fn new() -> Self {
        Self(BuildQueries, HeartRateQueries)
    }
}
