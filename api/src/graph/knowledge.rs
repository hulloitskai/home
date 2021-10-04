use super::prelude::*;

use crate::obsidian::Vault as ObsidianVault;

use std::collections::hash_map::Entry as MapEntry;

#[derive(Debug, Clone, SimpleObject)]
pub struct KnowledgeGraph {
    pub entries: Vec<KnowledgeGraphEntry>,
}

#[derive(Debug, Clone, SimpleObject)]
pub struct KnowledgeGraphEntry {
    pub id: String,
    pub names: Set<String>,
    pub links: KnowledgeGraphLinks,
}

#[derive(Debug, Clone, SimpleObject)]
pub struct KnowledgeGraphLinks {
    pub outgoing: Set<String>,
    pub incoming: Set<String>,
}

#[derive(Debug, Clone, Copy)]
pub struct KnowledgeQueries;

#[Object]
impl KnowledgeQueries {
    async fn knowledge(&self, ctx: &Context<'_>) -> KnowledgeGraph {
        let Services { obsidian, .. } = ctx.entity().services();
        let ObsidianVault { names, graph } = obsidian.get_vault();

        let backlinks = {
            let mut backlinks = Map::<String, Set<String>>::new();
            for (name, links) in &graph {
                for link in links {
                    use MapEntry::*;
                    let backlinks = match backlinks.entry(link.to_owned()) {
                        Occupied(entry) => entry.into_mut(),
                        Vacant(entry) => entry.insert(Set::new()),
                    };
                    backlinks.insert(name.to_owned());
                }
            }
            backlinks
        };

        let entries = {
            let mut entries = Vec::<KnowledgeGraphEntry>::new();
            for (id, names) in names {
                let links = {
                    let outgoing = graph
                        .get(&id)
                        .map(ToOwned::to_owned)
                        .unwrap_or_default();
                    let incoming = backlinks
                        .get(&id)
                        .map(ToOwned::to_owned)
                        .unwrap_or_default();
                    KnowledgeGraphLinks { outgoing, incoming }
                };
                entries.push(KnowledgeGraphEntry { id, names, links });
            }
            entries.sort_by_cached_key(|entry| entry.id.clone());
            entries
        };
        KnowledgeGraph { entries }
    }
}
