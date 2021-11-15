use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(
    BuildQuery,
    HeartRateQuery,
    MusicInfoQuery,
    KnowledgeEntryQuery,
    FormQuery,
    UserQuery,
);

impl Query {
    pub fn new() -> Self {
        Self(
            BuildQuery,
            HeartRateQuery,
            MusicInfoQuery,
            KnowledgeEntryQuery,
            FormQuery,
            UserQuery,
        )
    }
}

impl Default for Query {
    fn default() -> Self {
        Self::new()
    }
}
