use super::*;

pub type FormId = EntityId<Form>;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Object)]
pub struct Form {
    pub handle: Handle,
    pub name: String,
    pub description: Option<String>,
    pub fields: Vec<FormField>,
    pub respondent_label: Option<String>,
    pub respondent_helper: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormField {
    pub question: String,
    pub input: FormFieldInputConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FormFieldInputConfig {
    Text,
    SingleChoice { options: Set<String> },
    MultipleChoice { options: Set<String> },
}

impl Entity for Form {
    const NAME: &'static str = "Form";

    type Services = Services;
    type Conditions = FormConditions;
    type Sorting = EmptySorting;
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormConditions {
    #[builder(setter(into))]
    pub handle: Option<Handle>,
}

impl EntityConditions for FormConditions {
    fn into_document(self) -> Document {
        let FormConditions { handle } = self;

        let mut doc = Document::new();
        if let Some(handle) = handle {
            doc.insert("handle", handle);
        }

        doc
    }
}
