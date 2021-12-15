use super::*;

use std::fs::read_to_string;
use std::fs::File;
use std::io::ErrorKind as IoErrorKind;
use std::path::Path;

use yaml::Yaml;
use yaml_front_matter::parse as parse_front_matter;

use walkdir::WalkDir;

#[derive(Debug)]
pub(super) struct Reader {
    vault_path: String,
}

impl Reader {
    pub fn new(vault_path: &str) -> Result<Self> {
        let vault_path = if vault_path.ends_with('/') {
            vault_path.to_owned()
        } else {
            vault_path.to_owned() + "/"
        };

        let vault_dir =
            File::open(&vault_path).context("failed to open vault")?;
        let vault_dir_meta =
            vault_dir.metadata().context("failed to read vault")?;
        ensure!(vault_dir_meta.is_dir(), "vault must be a directory");

        let reader = Self { vault_path };
        Ok(reader)
    }

    pub fn list_notes(&self) -> Result<Set<String>> {
        let mut notes: Set<String> = default();
        for entry in WalkDir::new(&self.vault_path) {
            let entry = entry.context("failed to read directory entry")?;
            let path = entry.path();
            if path.extension().unwrap_or_default() != "md" {
                continue;
            }
            let path = path.with_extension("").to_string_lossy().into_owned();
            let id = path
                .strip_prefix(&self.vault_path)
                .map(ToOwned::to_owned)
                .unwrap_or(path);
            notes.insert(id);
        }
        Ok(notes)
    }

    pub fn read_note(&self, id: &str) -> Result<Option<Note>> {
        let id = id.to_owned();
        let path = self.note_path(&id);
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
                    parts = tail.to_vec();
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
            .id(id)
            .names(names)
            .links(links)
            .tags(tags)
            .build();
        Ok(Some(note))
    }

    fn note_path(&self, note_id: &str) -> String {
        let mut path = Path::new(&self.vault_path).to_path_buf();
        path.push(format!("{}.md", note_id));
        path.to_string_lossy().into_owned()
    }
}
