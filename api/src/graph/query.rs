use super::prelude::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(
    BuildQueries,
    KnowledgeEntryQueries,
    HeartRateQueries,
    MusicInfoQueries,
);

impl Query {
    pub fn new() -> Self {
        Self(
            BuildQueries,
            KnowledgeEntryQueries,
            HeartRateQueries,
            MusicInfoQueries,
        )
    }
}
