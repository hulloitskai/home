use super::*;

pub type KnowledgeEntryId = EntityId<KnowledgeEntry>;

#[derive(Debug, Clone, Serialize, Deserialize, Object, Builder)]
pub struct KnowledgeEntry {
    pub names: Set<String>,
    pub links: Set<String>,
    pub tags: Set<String>,
    pub text: String,
}

impl Entity for KnowledgeEntry {
    const NAME: &'static str = "KnowledgeEntry";

    type Services = Services;
    type Conditions = EmptyConditions;
    type Sorting = EmptySorting;
}
