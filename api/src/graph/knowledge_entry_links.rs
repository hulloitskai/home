use super::*;

use services::obsidian::Note as ObsidianNote;

#[derive(Debug, Clone, From)]
pub(super) struct KnowledgeEntryLinksObject {
    pub note: ObsidianNote,
}

#[Object(name = "KnowledgeEntryLinks")]
impl KnowledgeEntryLinksObject {
    async fn outgoing(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntryObject>> {
        let notes = ctx
            .services()
            .obsidian()
            .get_note_outgoing_references(&self.note.id)
            .await
            .into_field_result()?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntryObject::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }

    async fn incoming(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntryObject>> {
        let notes = ctx
            .services()
            .obsidian()
            .get_note_incoming_references(&self.note.id)
            .await
            .into_field_result()?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntryObject::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }
}
