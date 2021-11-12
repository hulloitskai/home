use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(
    BuildQuery,
    HeartRateQuery,
    MusicInfoQuery,
    KnowledgeEntryQuery,
);

impl Query {
    pub fn new() -> Self {
        Self(
            BuildQuery,
            HeartRateQuery,
            MusicInfoQuery,
            KnowledgeEntryQuery,
        )
    }
}

impl Default for Query {
    fn default() -> Self {
        Self::new()
    }
}
