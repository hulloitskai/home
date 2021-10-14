use super::*;

#[derive(
    Debug,
    Clone,
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

#[derive(Debug, Clone, Serialize, Deserialize, Object, Builder)]
pub struct KnowledgeEntry {
    pub names: Set<String>,
    pub links: Set<ObjectId>,
    pub tags: Set<String>,
}

impl Entity for KnowledgeEntry {
    const NAME: &'static str = "KnowledgeEntry";

    type Services = Services;
    type Id = KnowledgeEntryId;
    type Conditions = EmptyConditions;
    type Sorting = EmptySorting;
}
