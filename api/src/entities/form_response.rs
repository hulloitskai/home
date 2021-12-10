use super::*;

pub type FormResponseId = EntityId<FormResponse>;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormResponse {
    #[builder(default, setter(skip))]
    pub id: FormResponseId,

    #[builder(default = now(), setter(skip))]
    pub created_at: DateTime,

    pub form_id: EntityId<Form>,
    pub respondent: String,
    pub fields: Vec<FormResponseField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FormResponseDocument {
    pub _id: ObjectId,

    pub created_at: BsonDateTime,

    pub _form_id: ObjectId,

    pub respondent: String,
    pub fields: Vec<FormResponseField>,
}

impl From<FormResponse> for FormResponseDocument {
    fn from(response: FormResponse) -> Self {
        let FormResponse {
            id,
            form_id,
            created_at,
            respondent,
            fields,
        } = response;

        FormResponseDocument {
            _id: id.into(),
            _form_id: form_id.into(),
            created_at: BsonDateTime::from_chrono(created_at),
            respondent,
            fields,
        }
    }
}

impl From<FormResponseDocument> for FormResponse {
    fn from(doc: FormResponseDocument) -> Self {
        let FormResponseDocument {
            _id,
            created_at,
            _form_id,
            respondent,
            fields,
        } = doc;

        FormResponse {
            id: _id.into(),
            created_at: created_at.to_chrono(),
            form_id: _form_id.into(),
            respondent,
            fields,
        }
    }
}

impl Object for FormResponse {
    fn to_document(&self) -> Result<Document> {
        let doc = FormResponseDocument::from(self.to_owned());
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let doc = from_document::<FormResponseDocument>(doc)?;
        let response = Self::from(doc);
        Ok(response)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormResponseField {
    Text(String),
    SingleChoice(String),
    MultipleChoice(Set<String>),
}

impl Entity for FormResponse {
    const NAME: &'static str = "FormResponse";

    type Services = Services;
    type Conditions = FormResponseConditions;
    type Sorting = EmptySorting;

    fn id(&self) -> EntityId<Self> {
        self.id
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormResponseConditions {
    #[builder(setter(into))]
    pub form_id: Option<FormId>,
}

impl EntityConditions for FormResponseConditions {
    fn to_document(&self) -> Document {
        let FormResponseConditions { form_id } = self;

        let mut doc = Document::new();
        if let Some(form_id) = form_id {
            doc.insert("formId", form_id);
        }

        doc
    }
}

impl FormResponse {
    pub fn form(&self) -> FindOneQuery<Form> {
        Form::get(self.form_id)
    }
}
