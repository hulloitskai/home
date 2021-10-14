use super::*;

use crate::obsidian::Note as ObsidianNote;

#[derive(Debug, Clone, From)]
pub(super) struct KnowledgeEntry {
    pub note: ObsidianNote,
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

#[Object]
impl KnowledgeEntryLinks {
    async fn outgoing(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntry>> {
        let notes = ctx
            .services()
            .obsidian()
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
        let notes = ctx
            .services()
            .obsidian()
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
pub struct KnowledgeEntryQueries;

#[Object]
impl KnowledgeEntryQueries {
    async fn knowledge_entries(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<KnowledgeEntry>> {
        let notes = ctx
            .services()
            .obsidian()
            .list_notes()
            .await
            .into_field_result()?;
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
        let note = ctx
            .services()
            .obsidian()
            .get_note(&id)
            .await
            .into_field_result()?;
        let entry = note.map(KnowledgeEntry::from);
        Ok(entry)
    }
}
