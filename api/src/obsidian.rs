use super::prelude::*;

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
            // vault_file
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
    let mut vault = Vault::new();
    let dir = WalkDir::new(path);
    for entry in dir {
        let entry = match entry {
            Ok(entry) => entry,
            Err(_) => continue,
        };
        if !entry.file_type().is_file() {
            continue;
        }

        let entry_path = entry.path();
        match entry_path.extension() {
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
            entry_path = entry_path.to_str().unwrap(),
            "reading Obsidian vault entry"
        );

        // Insert entry names.
        let key = {
            let names = {
                let entry_path = entry_path
                    .with_extension("")
                    .to_str()
                    .expect("entry path has invalid unicode")
                    .to_owned();
                let entry_name = entry_path
                    .strip_prefix(path)
                    .map(ToOwned::to_owned)
                    .unwrap_or(entry_path);

                let mut names = Vec::<String>::new();
                let mut segments = entry_name
                    .split('/')
                    .map(ToOwned::to_owned)
                    .collect::<Vec<_>>();
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
            vault.names.insert(id.clone(), Set::from_iter(names));
            id
        };

        // Parse links.
        {
            lazy_static! {
                static ref REGEX: Regex =
                    Regex::new(r"\[\[([^\[\]]+)\]\]").unwrap();
            }
            let text =
                read_to_string(entry_path).context("failed to read entry")?;
            let links = REGEX
                .captures_iter(&text)
                .map(|m| m.get(1).unwrap().as_str().to_owned())
                .collect::<Set<_>>();
            vault.graph.insert(key.clone(), links);
        }

        // Normalize graph (replace aliases in backlinks).
        {
            let Vault { names, graph } = &mut vault;
            let names_lookup = {
                let mut lookup = Map::<String, String>::new();
                for (key, names) in names {
                    for other in names.iter() {
                        if let Some(value) = lookup.get(other) {
                            if value.len() <= key.len() {
                                continue;
                            }
                        }
                        lookup.insert(other.to_owned(), key.to_owned());
                    }
                }
                lookup
            };
            for links in graph.values_mut() {
                let mut next_links = Set::<String>::new();
                for link in links.iter() {
                    let next_link = names_lookup.get(link).unwrap_or(link);
                    next_links.insert(next_link.to_owned());
                }
                *links = next_links
            }
        }
    }
    Ok(vault)
}

#[derive(Debug, Clone, Default)]
pub struct Vault {
    pub names: Map<String, Set<String>>,
    pub graph: Map<String, Set<String>>,
}

impl Vault {
    pub fn new() -> Self {
        default()
    }
}
