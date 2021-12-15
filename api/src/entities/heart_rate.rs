use super::*;

pub type HeartRateId = EntityId<HeartRate>;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct HeartRate {
    #[builder(default, setter(skip))]
    pub id: HeartRateId,

    pub measured_at: DateTime,
    pub measurement: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HeartRateDocument {
    pub _id: ObjectId,
    pub measured_at: BsonDateTime,
    pub measurement: u16,
}

impl From<HeartRate> for HeartRateDocument {
    fn from(rate: HeartRate) -> Self {
        let HeartRate {
            id,
            measured_at,
            measurement,
        } = rate;

        HeartRateDocument {
            _id: id.into(),
            measured_at: BsonDateTime::from_chrono(measured_at),
            measurement,
        }
    }
}

impl From<HeartRateDocument> for HeartRate {
    fn from(doc: HeartRateDocument) -> Self {
        let HeartRateDocument {
            _id,
            measured_at,
            measurement,
        } = doc;

        Self {
            id: _id.into(),
            measured_at: measured_at.to_chrono(),
            measurement,
        }
    }
}

impl Object for HeartRate {
    fn to_document(&self) -> Result<Document> {
        let doc = HeartRateDocument::from(self.clone());
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let doc = from_document::<HeartRateDocument>(doc)?;
        let rate = Self::from(doc);
        Ok(rate)
    }
}

impl Entity for HeartRate {
    const NAME: &'static str = "HeartRate";

    type Services = Services;
    type Conditions = HeartRateConditions;
    type Sorting = HeartRateSorting;

    fn id(&self) -> EntityId<Self> {
        self.id
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, Builder)]
pub struct HeartRateConditions {
    #[builder(default, setter(into))]
    pub measured_at: Option<Comparison<DateTime>>,
}

impl EntityConditions for HeartRateConditions {
    fn to_document(&self) -> Document {
        let HeartRateConditions { measured_at } = self;
        let mut doc = Document::new();
        if let Some(measured_at) = measured_at {
            doc.insert("measuredAt", measured_at);
        }
        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HeartRateSorting {
    MeasuredAt(SortingDirection),
}

impl EntitySorting for HeartRateSorting {
    fn to_document(&self) -> Document {
        use HeartRateSorting::*;
        match self {
            MeasuredAt(direction) => doc! { "measuredAt": direction },
        }
    }
}
