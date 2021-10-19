use super::*;

use std::fs::read_to_string;
use std::fs::File;
use std::io::ErrorKind as IoErrorKind;
use std::path::Path;

use yaml::Yaml;
use yaml_front_matter::parse as parse_front_matter;

use walkdir::WalkDir;

#[derive(Debug, Clone, Builder)]
pub struct ClientConfig {
    vault_path: String,

    #[builder(default = Duration::minutes(1))]
    ttl: Duration,
}

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Client {
    reader: Arc<VaultReader>,

    #[derivative(Debug = "ignore")]
    notes_cache: Cache<String, Option<Note>>,

    #[derivative(Debug = "ignore")]
    notes_sem: Semaphore,

    #[derivative(Debug = "ignore")]
    notes_list_cache: Cache<(), Set<String>>,

    #[derivative(Debug = "ignore")]
    notes_list_sem: Semaphore,
}

impl Client {
    pub fn new(config: ClientConfig) -> Result<Self> {
        let ClientConfig { vault_path, ttl } = config;
        let ttl = ttl.to_std().context("invalid TTL")?;
        let client = Self {
            reader: {
                let reader = VaultReader::new(&vault_path)?;
                Arc::new(reader)
            },
            notes_cache: CacheBuilder::new(1000).time_to_live(ttl).build(),
            notes_sem: Semaphore::new(1),
            notes_list_cache: {
                CacheBuilder::new(1000).time_to_live(ttl).build()
            },
            notes_list_sem: Semaphore::new(1),
        };
        Ok(client)
    }

    pub async fn list_notes(&self) -> Result<Vec<Note>> {
        let Self {
            reader,
            notes_list_cache: cache,
            notes_list_sem: sem,
            ..
        } = self;

        // Acquire permit.
        let _permit = sem.acquire().await.unwrap();

        // Retrieve list from cache, otherwise list from disk.
        let notes = cache.get(&());
        let notes = match notes {
            Some(notes) => {
                trace!(
                    target: "home-api::obsidian",
                    count = notes.len(),
                    "got notes from cache"
                );
                notes
            }
            None => {
                let notes = {
                    let reader = reader.to_owned();
                    spawn_blocking(move || reader.list_notes())
                        .await
                        .unwrap()?
                };
                cache.insert((), notes.clone()).await;
                debug!(
                    target: "home-api::obsidian",
                    count = notes.len(),
                    "got notes"
                );
                notes
            }
        };

        // Resolve notes by their IDs.
        let notes: Vec<Note> = {
            let notes = notes.into_iter().map(|note| async move {
                self.get_note(&note)
                    .await
                    .with_context(|| format!("failed to get note {}", &note))?
                    .with_context(|| format!("missing note {}", &note))
            });
            try_join_all(notes).await?
        };
        Ok(notes)
    }

    pub async fn get_note(&self, id: &str) -> Result<Option<Note>> {
        let Self {
            reader,
            notes_cache: cache,
            notes_sem: sem,
            ..
        } = self;

        // Acquire permit.
        let _permit = sem.acquire().await.unwrap();

        // Retrieve note from cache, otherwise read note from disk.
        let note = cache.get(&String::from(id));
        let note = match note {
            Some(note) => {
                trace!(
                    target: "home-api::obsidian",
                    note = id,
                    "got note from cache"
                );
                note
            }
            None => {
                let note = {
                    let id = id.to_owned();
                    let reader = reader.to_owned();
                    spawn_blocking(move || {
                        reader.read_note(&id).context("failed to read note")
                    })
                    .await
                    .unwrap()?
                };
                cache.insert(id.to_owned(), note.clone()).await;
                debug!(
                    target: "home-api::obsidian",
                    note = %id,
                    "got note"
                );
                note
            }
        };
        Ok(note)
    }

    pub async fn get_note_outgoing_references(
        &self,
        note: &str,
    ) -> Result<Vec<Note>> {
        let note = self.get_note(note).await.context("failed to get note")?;
        let note = match note {
            Some(note) => note,
            None => return Ok(default()),
        };
        let notes = self.list_notes().await.context("failed to list notes")?;
        let notes_by_name = {
            let mut lookup: Map<String, Note> = default();
            for other_note in &notes {
                for name in &other_note.names {
                    if let Some(target) = lookup.get(name) {
                        if target.id.len() <= other_note.id.len() {
                            continue;
                        }
                    }
                    lookup.insert(name.to_owned(), other_note.to_owned());
                }
            }
            lookup
        };
        let refs = note
            .links
            .into_iter()
            .map(|link| {
                notes_by_name
                    .get(&link)
                    .map(ToOwned::to_owned)
                    .unwrap_or_else(|| {
                        Note::builder()
                            .id(link.clone())
                            .names(Set::from_iter([link.clone()]))
                            .build()
                    })
            })
            .collect::<Vec<_>>();
        Ok(refs)
    }

    pub async fn get_note_incoming_references(
        &self,
        note: &str,
    ) -> Result<Vec<Note>> {
        let note = self.get_note(note).await.context("failed to get note")?;
        let note = match note {
            Some(note) => note,
            None => return Ok(default()),
        };
        let other_notes = {
            let other_notes =
                self.list_notes().await.context("failed to list notes")?;
            other_notes
                .into_iter()
                .filter(|other_note| other_note.id != note.id)
                .collect::<Vec<_>>()
        };
        let refs = other_notes
            .into_iter()
            .filter(|other_note| {
                other_note.links.intersection(&note.names).count() > 0
            })
            .collect::<Vec<_>>();
        Ok(refs)
    }
}

#[derive(Debug)]
struct VaultReader {
    path: String,
    dir: File,
}

impl VaultReader {
    fn new(path: &str) -> Result<Self> {
        let path = if path.ends_with('/') {
            path.to_owned()
        } else {
            path.to_owned() + "/"
        };

        let dir = File::open(&path).context("failed to open vault")?;
        let dir_meta = dir.metadata().context("failed to read vault")?;
        ensure!(dir_meta.is_dir(), "vault must be a directory");

        let reader = Self { path, dir };
        Ok(reader)
    }

    fn note_path(&self, note: &str) -> String {
        let mut path = Path::new(&self.path).to_path_buf();
        path.push(format!("{}.md", note));
        path.to_string_lossy().into_owned()
    }

    fn list_notes(&self) -> Result<Set<String>> {
        let mut notes: Set<String> = default();
        for entry in WalkDir::new(&self.path) {
            let entry = entry.context("failed to read directory entry")?;
            let path = entry.path();
            if path.extension().unwrap_or_default() != "md" {
                continue;
            }
            let path = path.with_extension("").to_string_lossy().into_owned();
            let id = path
                .strip_prefix(&self.path)
                .map(ToOwned::to_owned)
                .unwrap_or(path);
            notes.insert(id);
        }
        Ok(notes)
    }

    fn read_note(&self, id: &str) -> Result<Option<Note>> {
        let path = self.note_path(id);
        let text = match read_to_string(&path) {
            Ok(text) => text,
            Err(error) => {
                if error.kind() == IoErrorKind::NotFound {
                    return Ok(None);
                }
                return Err(error).context("failed to read file")?;
            }
        };

        let names = {
            let mut names: Set<String> = default();
            let mut parts =
                id.split('/').map(ToOwned::to_owned).collect::<Vec<_>>();
            while !parts.is_empty() {
                names.insert(parts.join("/"));
                if let Some((_, tail)) = parts.split_first() {
                    parts = tail.into_iter().cloned().collect();
                }
            }
            names
        };

        let links = {
            lazy_static! {
                static ref RE: Regex =
                    Regex::new(r"\[\[([^\[\]]+)\]\]").unwrap();
            }
            RE.captures_iter(&text)
                .map(|m| m.get(1).unwrap().as_str().to_owned())
                .collect::<Set<_>>()
        };
        let tags = {
            let matter = parse_front_matter(&text)
                .context("failed to parse front matter")?;
            matter
                .map(Yaml::into_hash)
                .flatten()
                .map(|mut hash| {
                    let key = Yaml::String("tags".to_owned());
                    hash.remove(&key)
                })
                .flatten()
                .map(|tags| {
                    use Yaml::*;
                    let tags = match tags {
                        String(tag) => Set::from_iter([tag]),
                        Array(tags) => tags
                            .into_iter()
                            .filter_map(Yaml::into_string)
                            .collect::<Set<_>>(),
                        _ => return None,
                    };
                    Some(tags)
                })
                .flatten()
                .unwrap_or_default()
        };

        let note = Note::builder()
            .id(id.to_owned())
            .names(names)
            .links(links)
            .tags(tags)
            .build();
        Ok(Some(note))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct Note {
    pub id: String,
    pub names: Set<String>,

    #[builder(default)]
    pub links: Set<String>,

    #[builder(default)]
    pub tags: Set<String>,
}
