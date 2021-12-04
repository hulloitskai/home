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

    async fn form(&self, ctx: &Context<'_>) -> FieldResult<FormObject> {
        self.resolve_form(ctx).await.map_err(format_error)
    }
}

impl FormResponseObject {
    async fn resolve_form(&self, ctx: &Context<'_>) -> Result<FormObject> {
        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());

        let form = self
            .record
            .form()
            .load(&ctx)
            .await
            .context("failed to load form")?;

        let form = FormObject::from(form);
        Ok(form)
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

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct FormResponseQuery;

#[Object]
impl FormResponseQuery {
    async fn form_response(
        &self,
        ctx: &Context<'_>,
        id: Id<FormResponse>,
    ) -> FieldResult<Option<FormResponseObject>> {
        self.resolve_form_response(ctx, id)
            .await
            .map_err(format_error)
    }
}

impl FormResponseQuery {
    async fn resolve_form_response(
        &self,
        ctx: &Context<'_>,
        id: Id<FormResponse>,
    ) -> Result<Option<FormResponseObject>> {
        let userinfo = ctx.userinfo();
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        if let Some(userinfo) = userinfo {
            ensure!(userinfo.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }

        let response_id = FormResponseId::from(id);
        let response = FormResponse::get(response_id)
            .optional()
            .load(&ctx)
            .await
            .context("failed to load formresponse")?;

        let response = response.map(FormResponseObject::from);
        Ok(response)
    }
}
