use super::prelude::*;

use crate::obsidian::Note as ObsidianNote;

#[derive(Debug, Clone, From)]
pub struct KnowledgeEntry {
    note: ObsidianNote,
}

#[Object]
impl KnowledgeEntry {
    async fn id(&self) -> &String {
        &self.note.id
    }

    async fn names(&self) -> &Set<String> {
        &self.note.names
    }

    async fn links(&self) -> KnowledgeEntryLinks {
        self.note.clone().into()
    }

    async fn tags(&self) -> &Set<String> {
        &self.note.tags
    }
}

#[derive(Debug, Clone, From)]
pub struct KnowledgeEntryLinks {
    note: ObsidianNote,
}

#[Object]
impl KnowledgeEntryLinks {
    async fn outgoing(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntry>> {
        let Services { obsidian, .. } = ctx.entity().services();
        let notes = obsidian
            .get_note_outgoing_references(&self.note.id)
            .await
            .into_field_result()?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntry::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }

    async fn incoming(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntry>> {
        let Services { obsidian, .. } = ctx.entity().services();
        let notes = obsidian
            .get_note_incoming_references(&self.note.id)
            .await
            .into_field_result()?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntry::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }
}

#[derive(Debug, Clone, Copy)]
pub struct KnowledgeQueries;

#[Object]
impl KnowledgeQueries {
    async fn knowledge_entries(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntry>> {
        let Services { obsidian, .. } = ctx.entity().services();
        let notes = obsidian.list_notes().await.into_field_result()?;
        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntry::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        Ok(entries)
    }

    async fn knowledge_entry(
        &self,
        ctx: &Context<'_>,
        id: String,
    ) -> FieldResult<Option<KnowledgeEntry>> {
        let Services { obsidian, .. } = ctx.entity().services();
        let note = obsidian.get_note(&id).await.into_field_result()?;
        let entry = note.map(KnowledgeEntry::from);
        Ok(entry)
    }
}
