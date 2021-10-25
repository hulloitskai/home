use super::*;

#[derive(
    Debug,
    Clone,
    Copy,
    Hash,
    From,
    Into,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Serialize,
    Deserialize,
)]
pub struct KnowledgeEntryId(ObjectId);

impl EntityId for KnowledgeEntryId {
    type Entity = KnowledgeEntry;
}

impl From<KnowledgeEntryId> for Bson {
    fn from(rate: KnowledgeEntryId) -> Self {
        let KnowledgeEntryId(id) = rate;
        id.into()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Object, Builder)]
pub struct KnowledgeEntry {
    pub names: Set<String>,
    pub links: Set<KnowledgeEntryId>,
    pub tags: Set<String>,
    pub text: String,
}

impl Entity for KnowledgeEntry {
    const NAME: &'static str = "KnowledgeEntry";

    type Services = Services;
    type Id = KnowledgeEntryId;
    type Conditions = EmptyConditions;
    type Sorting = EmptySorting;
}
