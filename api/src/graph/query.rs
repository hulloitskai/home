use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(
    BuildQuery,
    HeartRateQuery,
    MusicInfoQuery,
    KnowledgeEntryQuery,
    FormQuery,
);

impl Query {
    pub fn new() -> Self {
        Self(
            BuildQuery,
            HeartRateQuery,
            MusicInfoQuery,
            KnowledgeEntryQuery,
            FormQuery,
        )
    }
}

impl Default for Query {
    fn default() -> Self {
        Self::new()
    }
}
