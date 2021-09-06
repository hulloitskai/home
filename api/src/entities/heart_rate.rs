use super::prelude::*;

#[derive(
    Clone,
    Copy,
    Hash,
    IntoBson,
    PartialEq,
    Eq,
    Default,
    ObjectTypeSerde,
    ObjectType,
)]
pub struct HeartRateType;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct HeartRate {
    #[builder(default, setter(skip))]
    pub id: ObjectId,

    #[builder(default = Utc::now(), setter(skip))]
    pub created_at: DateTime,

    #[builder(default = Utc::now(), setter(skip))]
    pub updated_at: DateTime,

    pub measurement: u16,
    pub timestamp: DateTime<FixedOffset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct HeartRateDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub created_at: BsonDateTime,
    pub updated_at: BsonDateTime,
    pub measurement: u16,
    pub timestamp: BsonDateTime,
}

impl Object for HeartRate {
    type Type = HeartRateType;

    fn id(&self) -> ObjectId {
        self.id.clone()
    }

    fn r#type(&self) -> Self::Type {
        default()
    }

    fn to_document(&self) -> Result<Document> {
        let Self {
            id,
            created_at,
            updated_at,
            measurement,
            timestamp,
        } = self.clone();

        let doc = HeartRateDocument {
            id,
            created_at: created_at.into(),
            updated_at: updated_at.into(),
            measurement,
            timestamp: timestamp.into(),
        };
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let HeartRateDocument {
            id,
            created_at,
            updated_at,
            measurement,
            timestamp,
        } = from_document(doc)?;
        let timestamp = DateTime::from(timestamp);

        let rate = Self {
            id,
            created_at: created_at.into(),
            updated_at: updated_at.into(),
            measurement,
            timestamp: timestamp.into(),
        };
        Ok(rate)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, Builder)]
pub struct HeartRateConditions {
    #[builder(default, setter(into))]
    pub id: Option<ObjectId>,

    #[builder(default, setter(into))]
    pub timestamp: Option<Comparison<DateTime>>,
}

impl From<HeartRateConditions> for Document {
    fn from(conditions: HeartRateConditions) -> Self {
        let HeartRateConditions { id, timestamp } = conditions;
        let mut doc = Document::new();
        if let Some(id) = id {
            doc.insert("_id", id);
        }
        if let Some(timestamp) = timestamp {
            doc.insert("timestamp", timestamp);
        }
        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HeartRateSorting {
    CreatedAt(SortingOrder),
    UpdatedAt(SortingOrder),
    Timestamp(SortingOrder),
}

impl From<HeartRateSorting> for Document {
    fn from(sorting: HeartRateSorting) -> Document {
        use HeartRateSorting::*;
        match sorting {
            CreatedAt(order) => doc! { "created_at": order },
            UpdatedAt(order) => doc! { "updated_at": order },
            Timestamp(order) => doc! { "timestamp": order },
        }
    }
}

impl Entity for HeartRate {
    const COLLECTION_NAME: &'static str = "heart_rates";

    type Conditions = HeartRateConditions;
    type Sorting = HeartRateSorting;
}
