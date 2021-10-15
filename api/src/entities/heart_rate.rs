use super::*;

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

impl From<HeartRateId> for Bson {
    fn from(rate: HeartRateId) -> Self {
        let HeartRateId(id) = rate;
        id.into()
    }
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
        let HeartRate {
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

    type Services = Services;
    type Id = HeartRateId;
    type Conditions = HeartRateConditions;
    type Sorting = HeartRateSorting;
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, Builder)]
pub struct HeartRateConditions {
    #[builder(default, setter(into))]
    pub timestamp: Option<Comparison<DateTime>>,
}

impl EntityConditions for HeartRateConditions {
    fn into_document(self) -> Document {
        let HeartRateConditions { timestamp } = self;
        let mut doc = Document::new();
        if let Some(timestamp) = timestamp {
            doc.insert("timestamp", timestamp);
        }
        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HeartRateSorting {
    Timestamp(SortingDirection),
}

impl EntitySorting for HeartRateSorting {
    fn into_document(self) -> Document {
        use HeartRateSorting::*;
        match self {
            Timestamp(order) => doc! { "timestamp": order },
        }
    }
}
