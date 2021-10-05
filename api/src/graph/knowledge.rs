use super::prelude::*;

use crate::obsidian::Note as ObsidianNote;
use crate::obsidian::NoteLinks as ObsidianNoteLinks;
use crate::obsidian::NoteRef as ObsidianNoteRef;
use crate::obsidian::Vault as ObsidianVault;

#[derive(Debug, Clone)]
pub struct KnowledgeGraph;

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
}

#[derive(Debug, Clone, From)]
pub struct KnowledgeEntryLinks {
    note: ObsidianNote,
}

#[Object]
impl KnowledgeEntryLinks {
    async fn outgoing(&self, ctx: &Context<'_>) -> Vec<KnowledgeEntry> {
        let Services { obsidian, .. } = ctx.entity().services();
        let ObsidianVault { mut notes } = obsidian.get_vault();

        let ObsidianNote { id, links, .. } = &self.note;
        let notes = links
            .outgoing
            .iter()
            .map(|linked| {
                notes.remove(&linked.id).unwrap_or_else(|| ObsidianNote {
                    id: linked.id.clone(),
                    names: Set::from_iter([linked.id.clone()]),
                    links: ObsidianNoteLinks {
                        outgoing: default(),
                        incoming: {
                            let r#ref = ObsidianNoteRef { id: id.to_owned() };
                            Set::from_iter([r#ref])
                        },
                    },
                })
            })
            .collect::<Vec<_>>();

        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntry::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        entries
    }

    async fn incoming(&self, ctx: &Context<'_>) -> Vec<KnowledgeEntry> {
        let Services { obsidian, .. } = ctx.entity().services();
        let ObsidianVault { mut notes } = obsidian.get_vault();

        let ObsidianNote { id, links, .. } = &self.note;
        let notes = links
            .incoming
            .iter()
            .map(|linked| {
                notes.remove(&linked.id).unwrap_or_else(|| ObsidianNote {
                    id: linked.id.clone(),
                    names: Set::from_iter([linked.id.clone()]),
                    links: ObsidianNoteLinks {
                        outgoing: default(),
                        incoming: {
                            let r#ref = ObsidianNoteRef { id: id.to_owned() };
                            Set::from_iter([r#ref])
                        },
                    },
                })
            })
            .collect::<Vec<_>>();

        let mut entries = notes
            .into_iter()
            .map(KnowledgeEntry::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        entries
    }
}

#[derive(Debug, Clone, Copy)]
pub struct KnowledgeQueries;

#[Object]
impl KnowledgeQueries {
    async fn knowledge_entries(
        &self,
        ctx: &Context<'_>,
    ) -> Vec<KnowledgeEntry> {
        let Services { obsidian, .. } = ctx.entity().services();
        let ObsidianVault { notes } = obsidian.get_vault();

        let mut entries = notes
            .into_values()
            .map(KnowledgeEntry::from)
            .collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.note.id.clone());
        entries
    }

    async fn knowledge_entry(
        &self,
        ctx: &Context<'_>,
        id: String,
    ) -> Option<KnowledgeEntry> {
        let Services { obsidian, .. } = ctx.entity().services();
        let ObsidianVault { mut notes } = obsidian.get_vault();

        let entry = notes.remove(&id);
        entry.map(KnowledgeEntry::from)
    }
}
