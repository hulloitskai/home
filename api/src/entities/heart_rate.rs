use super::prelude::*;

#[derive(
    Debug,
    Clone,
    Hash,
    From,
    Into,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Serialize,
    Deserialize,
)]
pub struct HeartRateId(ObjectId);

impl EntityId for HeartRateId {
    type Entity = HeartRate;
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct HeartRate {
    pub timestamp: DateTime,
    pub measurement: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct HeartRateDocument {
    timestamp: BsonDateTime,
    measurement: u16,
}

impl Object for HeartRate {
    fn to_document(&self) -> Result<Document> {
        let Self {
            timestamp,
            measurement,
        } = self.clone();
        let doc = HeartRateDocument {
            timestamp: timestamp.into(),
            measurement,
        };
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let HeartRateDocument {
            timestamp,
            measurement,
        } = from_document(doc)?;
        let rate = Self {
            timestamp: timestamp.to_chrono(),
            measurement,
        };
        Ok(rate)
    }
}

impl Entity for HeartRate {
    const NAME: &'static str = "HeartRate";

    type Id = HeartRateId;
    type Conditions = HeartRateConditions;
    type Sorting = HeartRateSorting;
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, Builder)]
pub struct HeartRateConditions {
    #[builder(default, setter(into))]
    pub timestamp: Option<Cmp<DateTime>>,
}

impl From<HeartRateConditions> for Document {
    fn from(conditions: HeartRateConditions) -> Self {
        let HeartRateConditions { timestamp } = conditions;
        let mut doc = Document::new();
        if let Some(timestamp) = timestamp {
            doc.insert("timestamp", timestamp);
        }
        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HeartRateSorting {
    Timestamp(SortingOrder),
}

impl From<HeartRateSorting> for Document {
    fn from(sorting: HeartRateSorting) -> Document {
        use HeartRateSorting::*;
        match sorting {
            Timestamp(order) => doc! { "timestamp": order },
        }
    }
}
