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
    type Type: ObjectType;

    fn id(&self) -> ObjectId;
    fn r#type(&self) -> Self::Type;

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

        // // Remove null values.
        // let doc: Document = doc
        //     .into_iter()
        //     .filter(|(_, value)| !matches!(value, Bson::Null))
        //     .collect();

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

pub trait ObjectType
where
    Self: Send + Sync,
    Self: Debug + Display,
    Self: Clone + Copy,
    Self: FromStr,
    Self: Serialize + DeserializeOwned,
{
    const NAME: &'static str;

    fn key(self, id: ObjectId) -> ObjectKey<Self> {
        ObjectKey::new(id, self)
    }
}

pub use macros::{ObjectType, ObjectTypeSerde};

#[derive(
    Debug,
    Clone,
    Constructor,
    Hash,
    IntoBson,
    PartialEq,
    Eq,
    Serialize,
    Deserialize,
)]
pub struct ObjectKey<T: ObjectType> {
    pub id: ObjectId,
    #[serde(deserialize_with = "T::deserialize")]
    pub r#type: T,
}

impl<T: ObjectType> ObjectKey<T> {
    pub fn cast<U: ObjectType>(self) -> ObjectKey<U>
    where
        U: From<T>,
    {
        let ObjectKey { id, r#type } = self;
        let r#type: U = r#type.into();
        ObjectKey { id, r#type }
    }

    pub fn try_cast<U: ObjectType>(self) -> Result<ObjectKey<U>>
    where
        U: TryFrom<T>,
        <U as TryFrom<T>>::Error: Debug + Display + Send + Sync + 'static,
    {
        let ObjectKey { id, r#type } = self;
        let r#type: U =
            r#type.try_into().map_err(|message| Error::msg(message))?;
        let key = ObjectKey { id, r#type };
        Ok(key)
    }
}

impl<T: ObjectType> ObjectKey<T> {
    pub fn opaque(&self) -> String {
        let id = &self.id;
        let type_name = self.r#type.to_string();
        let raw = format!("{}:{}", &type_name, id);
        encode_base64(raw)
    }
}

impl<T: ObjectType> ObjectKey<T>
where
    <T as FromStr>::Err: StdError,
    <T as FromStr>::Err: Send + Sync + 'static,
{
    pub fn parse(opaque: &str) -> Result<Self> {
        let raw = decode_base64(opaque).context("failed to decode base64")?;
        let raw = String::from_utf8(raw).context("invalid UTF-8")?;
        let [type_name, id] = {
            let parts = raw.split(':').collect::<Vec<_>>();
            match parts[..] {
                [type_name, id] => [type_name, id],
                _ => bail!("bad format"),
            }
        };
        let id: ObjectId = id.parse().context("failed to parse ID")?;
        let r#type: T = type_name.parse().context("failed to parse type")?;
        let key = ObjectKey { id, r#type };
        Ok(key)
    }
}

impl<T: ObjectType> Display for ObjectKey<T>
where
    T: Display,
{
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        let opaque = self.opaque();
        Display::fmt(&opaque, f)
    }
}

impl<T: ObjectType> FromStr for ObjectKey<T>
where
    T: FromStr,
    <T as FromStr>::Err: StdError,
    <T as FromStr>::Err: Send + Sync + 'static,
{
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

pub trait ObjectRef {
    type Type: ObjectType;

    fn key(&self) -> ObjectKey<Self::Type>;
}

impl<T: ObjectType> ObjectRef for ObjectKey<T> {
    type Type = T;

    fn key(&self) -> ObjectKey<Self::Type> {
        self.clone()
    }
}

impl<T: Object> ObjectRef for T {
    type Type = T::Type;

    fn key(&self) -> ObjectKey<Self::Type> {
        let id = self.id();
        let r#type = self.r#type();
        ObjectKey::new(id, r#type)
    }
}
