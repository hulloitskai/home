use super::prelude::*;

pub use bson::oid::ObjectId;

pub trait Object
where
    Self: 'static,
    Self: Send + Sync,
    Self: Debug,
    Self: Clone,
    Self: Serialize + DeserializeOwned,
{
    fn id(&self) -> ObjectId;

    fn to_document(&self) -> Result<Document> {
        let mut doc = to_document(self)?;

        // Normalize ID field.
        let id = doc.remove("id").expect("missing `id` field");
        doc.insert("_id", id);

        // Normalize created-at timestamp.
        if let Some(created_at) = doc.get("created_at") {
            if let Bson::String(created_at) = created_at {
                let created_at: DateTime = created_at
                    .parse()
                    .context("failed to parse `created_at` field")?;
                doc.insert("created_at", created_at);
            }
        };

        // Normalize updated-at timestamp.
        if let Some(updated_at) = doc.get("updated_at") {
            if let Bson::String(updated_at) = updated_at {
                let updated_at: DateTime = updated_at
                    .parse()
                    .context("failed to parse `updated_at` field")?;
                doc.insert("updated_at", updated_at);
            }
        };

        // Normalize removed-at timestamp.
        if let Some(removed_at) = doc.get("removed_at") {
            if let Bson::String(removed_at) = removed_at {
                let removed_at: DateTime = removed_at
                    .parse()
                    .context("failed to parse `removed_at` field")?;
                doc.insert("removed_at", removed_at);
            }
        };

        Ok(doc)
    }

    fn from_document(mut doc: Document) -> Result<Self> {
        // Normalize ID field.
        let id = doc.remove("_id").expect("missing `_id` field");
        doc.insert("id", id);

        // Normalize created-at timestamp.
        if let Some(created_at) = doc.get("created_at") {
            if let Bson::DateTime(created_at) = created_at {
                let created_at = created_at.to_string();
                doc.insert("created_at", created_at);
            }
        };

        // Normalize updated-at timestamp.
        if let Some(updated_at) = doc.get("updated_at") {
            if let Bson::DateTime(updated_at) = updated_at {
                let updated_at = updated_at.to_string();
                doc.insert("updated_at", updated_at);
            }
        };

        let object = from_document(doc)?;
        Ok(object)
    }
}
