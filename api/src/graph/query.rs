use super::*;

#[derive(Debug, Clone, Copy, Default, MergedObject)]
pub struct Query(
    TestQuery,
    BuildQuery,
    HeartRateQuery,
    MusicInfoQuery,
    KnowledgeEntryQuery,
    FormQuery,
    UserQuery,
);

impl Query {
    pub fn new() -> Self {
        default()
    }
}
