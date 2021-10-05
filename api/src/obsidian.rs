use super::prelude::*;

use std::collections::hash_map::Entry as MapEntry;
use std::fs::read_to_string;
use std::fs::File;
use std::sync::{Arc, Mutex};

use walkdir::WalkDir;

#[derive(Debug)]
pub struct Client {
    scanner: Arc<Mutex<VaultScanner>>,
}

impl Client {
    pub fn new(vault_path: &str) -> Result<Self> {
        let scanner = VaultScanner::new(vault_path)?;
        let client = Self {
            scanner: Arc::new(Mutex::new(scanner)),
        };
        Ok(client)
    }

    pub fn get_vault(&self) -> Vault {
        let scanner = self.scanner.clone();
        let vault = {
            let scanner = scanner.lock().unwrap();
            scanner.data.clone()
        };
        spawn(async move {
            let mut parser = scanner.lock().unwrap();
            if let Err(error) = parser.sync() {
                error!(
                    target: "home-api::obsidian",
                    error = %format!("{:?}", &error),
                    "failed to scan Obsidian vault"
                );
            }
        });
        vault
    }
}

#[derive(Derivative)]
#[derivative(Debug)]
struct VaultScanner {
    path: String,

    #[derivative(Debug = "ignore")]
    data: Vault,

    sync_interval: Duration,
    sync_timestamp: Option<DateTime>,
}

impl VaultScanner {
    fn new(path: &str) -> Result<Self> {
        let path = if path.ends_with('/') {
            path.to_owned()
        } else {
            format!("{}/", path)
        };

        let file = File::open(&path).context("failed to open vault")?;
        let file_meta =
            file.metadata().context("failed to read vault metadata")?;
        ensure!(file_meta.is_dir(), "vault must be a directory");
        let data = scan_vault(&path).context("failed to scan vault")?;

        let parser = Self {
            path,
            data,
            sync_interval: Duration::minutes(1),
            sync_timestamp: default(),
        };
        Ok(parser)
    }
}

impl VaultScanner {
    fn scan(&self) -> Result<Vault> {
        scan_vault(&self.path)
    }

    fn sync(&mut self) -> Result<()> {
        if let Some(timestamp) = self.sync_timestamp {
            if Utc::now() < (timestamp + self.sync_interval) {
                return Ok(());
            }
        }
        self.data = self.scan()?;
        self.sync_timestamp = Some(Utc::now());
        Ok(())
    }
}

fn scan_vault(path: &str) -> Result<Vault> {
    trace!(target: "home-api::obsidian", %path, "scanning Obsidian vault");

    let mut notes_names = Map::<String, Set<String>>::new();
    let mut notes_links = Map::<String, Set<String>>::new();

    let dir = WalkDir::new(path);
    for entry in dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        if !entry.file_type().is_file() {
            continue;
        }

        let note_path = entry.path();
        match note_path.extension() {
            Some(extension) => {
                if extension != "md" {
                    continue;
                }
            }
            None => continue,
        }

        trace!(
            target: "home-api::obsidian",
            vault_path = path,
            note_path = note_path.to_str().unwrap(),
            "reading Obsidian note"
        );

        // Resolve note names.
        let note_id = {
            let names = {
                let note_path = note_path
                    .with_extension("")
                    .to_str()
                    .expect("note path has invalid unicode")
                    .to_owned();
                let name = note_path
                    .strip_prefix(path)
                    .map(ToOwned::to_owned)
                    .unwrap_or(note_path);

                let mut names = Vec::<String>::new();
                let mut segments =
                    name.split('/').map(ToOwned::to_owned).collect::<Vec<_>>();
                while !segments.is_empty() {
                    names.push(segments.join("/"));
                    if let Some((_, tail)) = segments.split_first() {
                        segments = tail.into_iter().cloned().collect();
                    }
                }
                names
            };
            let id = names
                .first()
                .map(ToOwned::to_owned)
                .context("could not procure entry name")?;
            notes_names.insert(id.clone(), Set::from_iter(names));
            id
        };

        // Resolve note links.
        {
            lazy_static! {
                static ref REGEX: Regex =
                    Regex::new(r"\[\[([^\[\]]+)\]\]").unwrap();
            }
            let text =
                read_to_string(note_path).context("failed to read entry")?;
            let links = REGEX
                .captures_iter(&text)
                .map(|m| m.get(1).unwrap().as_str().to_owned())
                .collect::<Set<_>>();
            notes_links.insert(note_id.clone(), links);
        }
    }

    // Normalize links (replace aliases with IDs).
    let mut notes_links = {
        // Create lookup table of note aliases to their IDs.
        let lookup = {
            let mut lookup = Map::<String, String>::new();
            for (id, names) in &notes_names {
                for alias in names {
                    if let Some(target) = lookup.get(alias) {
                        if target.len() <= id.len() {
                            continue;
                        }
                    }
                    lookup.insert(alias.to_owned(), id.to_owned());
                }
            }
            lookup
        };
        notes_links
            .into_iter()
            .map(|(key, links)| {
                let links = links
                    .into_iter()
                    .map(|link| {
                        lookup.get(&link).map(ToOwned::to_owned).unwrap_or(link)
                    })
                    .collect::<Set<_>>();
                (key, links)
            })
            .collect::<Map<_, _>>()
    };

    // Resolve backlinks.
    let mut notes_backlinks = {
        let mut backlinks = Map::<String, Set<String>>::new();
        for (name, links) in &notes_links {
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

    let notes = notes_names
        .into_iter()
        .map(|(id, names)| {
            let links = {
                let outgoing = notes_links
                    .remove(&id)
                    .unwrap_or_default()
                    .into_iter()
                    .map(NoteRef::new)
                    .collect::<Set<_>>();
                let incoming = notes_backlinks
                    .remove(&id)
                    .unwrap_or_default()
                    .into_iter()
                    .map(NoteRef::new)
                    .collect::<Set<_>>();
                NoteLinks { outgoing, incoming }
            };
            let note = Note {
                id: id.clone(),
                names,
                links,
            };
            (id, note)
        })
        .collect::<Map<_, _>>();

    let vault = Vault { notes };
    Ok(vault)
}

#[derive(Debug, Clone, Default)]
pub struct Vault {
    pub notes: Map<String, Note>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub names: Set<String>,
    pub links: NoteLinks,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct NoteLinks {
    pub incoming: Set<NoteRef>,
    pub outgoing: Set<NoteRef>,
}

#[derive(
    Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize,
)]
pub struct NoteRef {
    pub id: String,
}

impl NoteRef {
    pub fn new(id: String) -> Self {
        Self { id }
    }
}
