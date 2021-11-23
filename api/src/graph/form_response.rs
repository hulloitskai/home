use super::*;

#[derive(Debug, Clone, From)]
pub(super) struct FormResponseObject {
    pub record: Record<FormResponse>,
}

#[Object(name = "FormResponse")]
impl FormResponseObject {
    async fn id(&self) -> Id<FormResponse> {
        self.record.id().into()
    }

    async fn created_at(&self) -> DateTimeScalar {
        self.record.created_at().into()
    }

    async fn updated_at(&self) -> DateTimeScalar {
        self.record.updated_at().into()
    }

    async fn respondent(&self) -> &str {
        self.record.respondent.as_str()
    }

    async fn fields(&self) -> Vec<FormResponseFieldObject> {
        self.record
            .fields
            .iter()
            .cloned()
            .map(FormResponseFieldObject::from)
            .collect()
    }
}

#[derive(Debug, Clone, From)]
pub(super) struct FormResponseFieldObject(FormResponseField);

#[Object(name = "FormResponseField")]
impl FormResponseFieldObject {
    async fn text(&self) -> Option<&str> {
        let FormResponseFieldObject(field) = self;
        match field {
            FormResponseField::Text(text) => Some(text),
            _ => None,
        }
    }

    async fn single_choice(&self) -> Option<&str> {
        let FormResponseFieldObject(field) = self;
        match field {
            FormResponseField::SingleChoice(choice) => Some(choice),
            _ => None,
        }
    }

    async fn multiple_choice(&self) -> Option<Vec<&str>> {
        let FormResponseFieldObject(field) = self;
        match field {
            FormResponseField::MultipleChoice(choices) => {
                let choices =
                    choices.iter().map(String::as_str).collect::<Vec<_>>();
                Some(choices)
            }
            _ => None,
        }
    }
}
