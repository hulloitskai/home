use super::prelude::*;

use crate::obsidian::Note as ObsidianNote;

#[derive(Debug, Clone, From)]
pub(super) struct KnowledgeEntryLinks {
    pub note: ObsidianNote,
}
