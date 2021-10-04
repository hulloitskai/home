use super::prelude::*;

use crate::obsidian::Vault as ObsidianVault;

use std::collections::hash_map::Entry as MapEntry;

#[derive(Debug, Clone)]
pub struct KnowledgeGraph {
    pub entries: Map<String, KnowledgeGraphEntry>,
}

#[Object]
impl KnowledgeGraph {
    async fn entries(&self) -> Vec<KnowledgeGraphEntry> {
        let mut entries = self.entries.values().cloned().collect::<Vec<_>>();
        entries.sort_by_cached_key(|entry| entry.id.clone());
        entries
    }

    async fn entry(&self, id: String) -> Option<KnowledgeGraphEntry> {
        let entry = self.entries.get(&id);
        entry.map(ToOwned::to_owned)
    }
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
        let entries = names
            .into_iter()
            .map(|(key, names)| {
                let links = {
                    let outgoing = graph
                        .get(&key)
                        .map(ToOwned::to_owned)
                        .unwrap_or_default();
                    let incoming = backlinks
                        .get(&key)
                        .map(ToOwned::to_owned)
                        .unwrap_or_default();
                    KnowledgeGraphLinks { outgoing, incoming }
                };
                let entry = KnowledgeGraphEntry {
                    id: key.clone(),
                    names,
                    links,
                };
                (key, entry)
            })
            .collect::<Map<_, _>>();
        KnowledgeGraph { entries }
    }
}
