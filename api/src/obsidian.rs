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
    #[derivative(Debug = "ignore")]
    cached_notes: AsyncRwLock<Cache<String, Option<Note>>>,

    #[derivative(Debug = "ignore")]
    cached_notes_list: AsyncRwLock<Cache<(), Set<String>>>,

    reader: Arc<VaultReader>,
}

impl Client {
    pub fn new(config: ClientConfig) -> Result<Self> {
        let ClientConfig { vault_path, ttl } = config;
        let client = Self {
            cached_notes: {
                let cache = Cache::with_expiry_duration(ttl.to_std().unwrap());
                AsyncRwLock::new(cache)
            },
            cached_notes_list: {
                let cache = Cache::with_expiry_duration(ttl.to_std().unwrap());
                AsyncRwLock::new(cache)
            },
            reader: {
                let reader = VaultReader::new(&vault_path)?;
                Arc::new(reader)
            },
        };
        Ok(client)
    }

    pub async fn list_notes(&self) -> Result<Vec<Note>> {
        let notes = {
            let notes_list = self.cached_notes_list.read().await;
            notes_list.peek(&()).map(ToOwned::to_owned)
        };
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
                let mut notes_list = self.cached_notes_list.write().await;
                let notes = {
                    let reader = self.reader.clone();
                    spawn_blocking(move || reader.list_notes())
                        .await
                        .unwrap()?
                };
                notes_list.insert((), notes.clone());
                debug!(
                    target: "home-api::obsidian",
                    count = notes.len(),
                    "got notes"
                );
                notes
            }
        };
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
        let note = {
            let notes = self.cached_notes.read().await;
            notes.peek(id).map(ToOwned::to_owned)
        };
        let note = match note {
            Some(note) => {
                trace!(
                    target: "home-api::obsidian",
                    id,
                    "got note from cache"
                );
                note
            }
            None => {
                let mut notes = self.cached_notes.write().await;
                let note = {
                    let id = id.to_owned();
                    let reader = self.reader.clone();
                    spawn_blocking(move || {
                        reader.read_note(&id).context("failed to read note")
                    })
                    .await
                    .unwrap()?
                };
                notes.insert(id.to_owned(), note.clone());
                debug!(
                    target: "home-api::obsidian",
                    id,
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
                static ref REGEX: Regex =
                    Regex::new(r"\[\[([^\[\]]+)\]\]").unwrap();
            }
            REGEX
                .captures_iter(&text)
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
