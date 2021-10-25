use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(
    BuildQueries,
    HeartRateQueries,
    MusicInfoQueries,
    KnowledgeEntryQueries,
);

impl Query {
    pub fn new() -> Self {
        Self(
            BuildQueries,
            HeartRateQueries,
            MusicInfoQueries,
            KnowledgeEntryQueries,
        )
    }
}

impl Default for Query {
    fn default() -> Self {
        Self::new()
    }
}
