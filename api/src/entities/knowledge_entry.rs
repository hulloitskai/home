use super::*;

// pub type KnowledgeEntryId = EntityId<KnowledgeEntry>;

// #[derive(Debug, Clone, Serialize, Deserialize, Builder)]
// pub struct KnowledgeEntry {
//     #[builder(default)]
//     pub names: Set<String>,

//     #[builder(default)]
//     pub links: Set<String>,

//     #[builder(default)]
//     pub tags: Set<String>,

//     #[builder(default)]
//     pub text: String,
// }

// impl Object for KnowledgeEntry {
//     fn to_document(&self) -> Result<Document> {
//         let doc = to_document(self)?;
//         Ok(doc)
//     }

//     fn from_document(doc: Document) -> Result<Self> {
//         let entry: KnowledgeEntry = from_document(doc)?;
//         Ok(entry)
//     }
// }

// #[async_trait]
// impl Entity for KnowledgeEntry {
//     const NAME: &'static str = "KnowledgeEntry";

//     type Services = Services;
//     type Conditions = EmptyConditions;
//     type Sorting = EmptySorting;

//     fn id(&self) -> EntityId<Self> {
//         self.id.into()
//     }
// }
