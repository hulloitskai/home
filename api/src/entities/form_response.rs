use super::*;

pub type FormResponseId = EntityId<FormResponse>;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormResponse {
    pub form_id: EntityId<Form>,
    pub respondent: String,
    pub fields: Vec<FormResponseField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FormResponseDocument {
    pub form_id: ObjectId,
    pub respondent: String,
    pub fields: Vec<FormResponseField>,
}

impl Object for FormResponse {
    fn to_document(&self) -> Result<Document> {
        let FormResponse {
            form_id,
            respondent,
            fields,
        } = self;

        let doc = FormResponseDocument {
            form_id: form_id.to_object_id(),
            respondent: respondent.to_owned(),
            fields: fields.to_owned(),
        };
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let FormResponseDocument {
            form_id,
            respondent,
            fields,
        } = from_document(doc)?;

        let response = FormResponse {
            form_id: form_id.into(),
            respondent,
            fields,
        };
        Ok(response)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormResponseConditions {
    #[builder(setter(into))]
    pub form_id: Option<FormId>,
}

impl EntityConditions for FormResponseConditions {
    fn into_document(self) -> Document {
        let FormResponseConditions { form_id } = self;

        let mut doc = Document::new();
        if let Some(form_id) = form_id {
            let form_id = ObjectId::from(form_id);
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
