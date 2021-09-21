use super::prelude::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(BuildQueries, HeartQueries, MusicQueries);

impl Query {
    pub fn new() -> Self {
        Self(BuildQueries, HeartQueries, MusicQueries)
    }
}
