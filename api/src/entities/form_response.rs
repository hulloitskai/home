use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Object)]
pub struct FormResponse {
    pub form_id: EntityId<Form>,
    pub respondent: String,
    pub fields: Vec<FormFieldResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormFieldResponse {
    Text(String),
    SingleChoice(String),
    MultipleChoice(Vec<String>),
}

impl Entity for FormResponse {
    const NAME: &'static str = "FormResponse";

    type Services = Services;
    type Conditions = EmptyConditions;
    type Sorting = EmptySorting;
}
