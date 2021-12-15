use super::*;

#[derive(Debug, Clone, Builder)]
pub struct ServiceConfig {
    vault_path: String,

    #[builder(default = Duration::minutes(1))]
    ttl: Duration,
}

#[derive(Derivative)]
#[derivative(Debug)]
pub struct Service {
    reader: Arc<Reader>,

    #[derivative(Debug = "ignore")]
    notes_cache: Cache<String, Option<Note>>,

    #[derivative(Debug = "ignore")]
    notes_sem: Semaphore,

    #[derivative(Debug = "ignore")]
    notes_list_cache: Cache<(), Set<String>>,

    #[derivative(Debug = "ignore")]
    notes_list_sem: Semaphore,
}

impl Service {
    pub fn new(config: ServiceConfig) -> Result<Self> {
        let ServiceConfig { vault_path, ttl } = config;
        let ttl = ttl.to_std().context("invalid TTL")?;
        let client = Self {
            reader: {
                let reader = Reader::new(&vault_path)?;
                Arc::new(reader)
            },
            notes_cache: Cache::builder(1000).time_to_live(ttl).build(),
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
        let notes_ids = cache.get(&());
        let notes_ids = match notes_ids {
            Some(notes) => {
                trace!(count = notes.len(), "got notes from cache");
                notes
            }
            None => {
                let notes = {
                    let reader = reader.clone();
                    spawn_blocking(move || reader.list_notes())
                        .await
                        .unwrap()?
                };
                cache.insert((), notes.clone()).await;
                debug!(count = notes.len(), "got notes");
                notes
            }
        };

        // Resolve notes by their IDs.
        let notes: Vec<Note> = {
            let futures = notes_ids.into_iter().map(|id| async move {
                self.get_note(&id)
                    .await
                    .with_context(|| format!("failed to get note {}", &id))?
                    .with_context(|| format!("missing note {}", &id))
            });
            try_join_all(futures).await?
        };
        Ok(notes)
    }

    pub async fn get_note(&self, id: &str) -> Result<Option<Note>> {
        let id = id.to_owned();
        let Self {
            reader,
            notes_cache: cache,
            notes_sem: sem,
            ..
        } = self;

        // Acquire permit.
        let _permit = sem.acquire().await.unwrap();

        // Retrieve note from cache, otherwise read note from disk.
        let note = cache.get(&id);
        let note = match note {
            Some(note) => {
                trace!(note = %id, "got note from cache");
                note
            }
            None => {
                let note = {
                    let reader = reader.clone();
                    let id = id.clone();
                    spawn_blocking(move || {
                        reader.read_note(&id).context("failed to read note")
                    })
                    .await
                    .unwrap()?
                };
                cache.insert(id.clone(), note.clone()).await;
                debug!(%id, "got note");
                note
            }
        };
        Ok(note)
    }

    pub async fn get_note_outgoing_references(
        &self,
        note_id: &str,
    ) -> Result<Vec<Note>> {
        let note =
            self.get_note(note_id).await.context("failed to get note")?;
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
                    lookup.insert(name.clone(), other_note.clone());
                }
            }
            lookup
        };
        let references = note
            .links
            .into_iter()
            .map(|id| {
                notes_by_name
                    .get(&id)
                    .map(ToOwned::to_owned)
                    .unwrap_or_else(|| {
                        Note::builder()
                            .id(id.clone())
                            .names(Set::from_iter([id.clone()]))
                            .build()
                    })
            })
            .collect::<Vec<_>>();
        Ok(references)
    }

    pub async fn get_note_incoming_references(
        &self,
        note_id: &str,
    ) -> Result<Vec<Note>> {
        let note =
            self.get_note(note_id).await.context("failed to get note")?;
        let note = match note {
            Some(note) => note,
            None => return Ok(default()),
        };
        let other_notes = {
            let notes =
                self.list_notes().await.context("failed to list notes")?;
            notes
                .into_iter()
                .filter(|Note { id, .. }| *id != note.id)
                .collect::<Vec<_>>()
        };
        let references = other_notes
            .into_iter()
            .filter(|other_note| {
                other_note.links.intersection(&note.names).count() > 0
            })
            .collect::<Vec<_>>();
        Ok(references)
    }
}
