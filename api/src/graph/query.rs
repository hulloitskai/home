use super::prelude::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(BuildQueries, KnowledgeQueries, HeartQueries, MusicQueries);

impl Query {
    pub fn new() -> Self {
        Self(BuildQueries, KnowledgeQueries, HeartQueries, MusicQueries)
    }
}
