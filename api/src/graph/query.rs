use super::*;

#[derive(Debug, Clone, Copy, Default, MergedObject)]
pub struct Query(
    TestQuery,
    BuildQuery,
    HeartRateQuery,
    MusicInfoQuery,
    KnowledgeEntryQuery,
    FormQuery,
    FormResponseQuery,
    UserQuery,
);

impl Query {
    pub fn new() -> Self {
        default()
    }
}
