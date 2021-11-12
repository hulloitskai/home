use super::*;

use services::obsidian::Note as ObsidianNote;

#[derive(Debug, Clone, From)]
pub(super) struct KnowledgeEntryObject {
    pub note: ObsidianNote,
}

#[Object(name = "KnowledgeEntry")]
impl KnowledgeEntryObject {
    async fn id(&self) -> &String {
        &self.note.id
    }

    async fn names(&self) -> &Set<String> {
        &self.note.names
    }

    async fn links(&self) -> KnowledgeEntryLinksObject {
        self.note.clone().into()
    }

    async fn tags(&self) -> &Set<String> {
        &self.note.tags
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct KnowledgeEntryQuery;

#[Object]
impl KnowledgeEntryQuery {
    async fn knowledge_entries(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntryObject>> {
        let notes = ctx
            .services()
            .obsidian()
            .list_notes()
            .await
            .into_field_result()?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntryObject::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }

    async fn knowledge_entry(
        &self,
        ctx: &Context<'_>,
        id: String,
    ) -> FieldResult<Option<KnowledgeEntryObject>> {
        let note = ctx
            .services()
            .obsidian()
            .get_note(&id)
            .await
            .into_field_result()?;
        let entry = note.map(KnowledgeEntryObject::from);
        Ok(entry)
    }
}
