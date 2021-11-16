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
        let result = self.resolve_outgoing(ctx).await;
        into_field_result(result)
    }

    async fn incoming(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntryObject>> {
        let result = self.resolve_incoming(ctx).await;
        into_field_result(result)
    }
}

impl KnowledgeEntryLinksObject {
    async fn resolve_outgoing(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<KnowledgeEntryObject>> {
        let notes = ctx
            .services()
            .obsidian()
            .get_note_outgoing_references(&self.note.id)
            .await?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntryObject::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }

    async fn resolve_incoming(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<KnowledgeEntryObject>> {
        let notes = ctx
            .services()
            .obsidian()
            .get_note_incoming_references(&self.note.id)
            .await?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntryObject::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }
}
