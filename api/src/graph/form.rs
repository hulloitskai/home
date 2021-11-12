use super::*;

#[derive(Debug, Clone, From)]
pub(super) struct FormObject {
    pub record: Record<Form>,
}

#[Object(name = "Form")]
impl FormObject {
    async fn id(&self) -> Id<Form> {
        self.record.id().into()
    }

    async fn created_at(&self) -> DateTimeScalar {
        let created_at = self.record.created_at();
        created_at.into()
    }

    async fn updated_at(&self) -> DateTimeScalar {
        self.record.updated_at().into()
    }

    async fn handle(&self) -> &str {
        self.record.handle.as_str()
    }

    async fn name(&self) -> &str {
        self.record.name.as_str()
    }

    async fn description(&self) -> Option<&str> {
        self.record.description.as_deref()
    }

    async fn fields(&self) -> Vec<FormFieldObject> {
        self.record.fields.iter().cloned().map(Into::into).collect()
    }

    async fn respondent_label(&self) -> Option<&str> {
        self.record.respondent_label.as_deref()
    }

    async fn respondent_helper(&self) -> Option<&str> {
        self.record.respondent_helper.as_deref()
    }
}

#[derive(Debug, Clone, From)]
pub(super) struct FormFieldObject(FormField);

#[Object(name = "FormField")]
impl FormFieldObject {
    async fn question(&self) -> &str {
        let FormFieldObject(field) = self;
        field.question.as_str()
    }

    async fn input(&self) -> FormFieldInputConfigObject {
        let FormFieldObject(field) = self;
        let input = field.input.clone();
        input.into()
    }
}

#[derive(Debug, Clone, Default, SimpleObject)]
#[graphql(name = "FormFieldInputConfig")]
pub(super) struct FormFieldInputConfigObject {
    pub text: Option<bool>,
    pub single_choice: Option<FormFieldSingleChoiceInputConfigObject>,
    pub multiple_choice: Option<FormFieldMultipleChoiceInputConfigObject>,
}

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "FormFieldSingleChoiceInputConfig")]
pub(super) struct FormFieldSingleChoiceInputConfigObject {
    pub options: Set<String>,
}

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "FormFieldMultipleChoiceInputConfig")]
pub(super) struct FormFieldMultipleChoiceInputConfigObject {
    pub options: Set<String>,
}

impl From<FormFieldInputConfig> for FormFieldInputConfigObject {
    fn from(input: FormFieldInputConfig) -> Self {
        use FormFieldInputConfig::*;
        match input {
            Text => FormFieldInputConfigObject {
                text: Some(true),
                ..default()
            },
            SingleChoice { options } => FormFieldInputConfigObject {
                single_choice: {
                    let config =
                        FormFieldSingleChoiceInputConfigObject { options };
                    Some(config)
                },
                ..default()
            },
            MultipleChoice { options } => FormFieldInputConfigObject {
                multiple_choice: {
                    let config =
                        FormFieldMultipleChoiceInputConfigObject { options };
                    Some(config)
                },
                ..default()
            },
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct FormQuery;

#[Object]
impl FormQuery {
    async fn form(
        &self,
        ctx: &Context<'_>,
        id: Id<Form>,
    ) -> FieldResult<Option<FormObject>> {
        let form_id = FormId::from(id);

        let services = ctx.services();
        let ctx = EntityContext::new(services);

        let form = Form::get(form_id)
            .optional()
            .load(&ctx)
            .await
            .context("failed to load form")
            .into_field_result()?;

        let form = form.map(FormObject::from);
        Ok(form)
    }

    async fn form_by_handle(
        &self,
        ctx: &Context<'_>,
        handle: String,
    ) -> FieldResult<Option<FormObject>> {
        let handle = Handle::from_str(&handle)
            .context("failed to parse handle")
            .into_field_result()?;

        let services = ctx.services();
        let ctx = EntityContext::new(services);

        let form = Form::find_one({
            FormConditions::builder().handle(handle).build()
        })
        .optional()
        .load(&ctx)
        .await
        .context("failed to load form")
        .into_field_result()?;

        let form = form.map(FormObject::from);
        Ok(form)
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct FormMutation;

#[Object]
impl FormMutation {
    async fn create_form(
        &self,
        ctx: &Context<'_>,
        input: CreateFormInput,
        secret: String,
    ) -> FieldResult<CreateFormPayload> {
        let services = ctx.services();
        let settings = services.settings();
        let ctx = EntityContext::new(services.clone());

        if secret != settings.api_secret {
            let error = FieldError::new("incorrect secret");
            return Err(error);
        }

        let CreateFormInput {
            handle,
            name,
            description,
            fields,
            respondent_label,
            respondent_helper,
        } = input;

        let handle = Handle::from_str(&handle)
            .context("failed to parse handle")
            .into_field_result()?;
        let fields = fields
            .into_iter()
            .map(FormField::try_from)
            .collect::<Result<Vec<_>>>()
            .context("invalid form field")
            .into_field_result()?;

        let mut form = Record::new({
            Form::builder()
                .handle(handle)
                .name(name)
                .description(description)
                .fields(fields)
                .respondent_label(respondent_label)
                .respondent_helper(respondent_helper)
                .build()
        });
        form.save(&ctx)
            .await
            .context("failed to save form")
            .into_field_result()?;

        let form = FormObject::from(form);
        let payload = CreateFormPayload { form, ok: true };
        Ok(payload)
    }

    async fn submit_form(
        &self,
        ctx: &Context<'_>,
        input: SubmitFormInput,
    ) -> FieldResult<SubmitFormPayload> {
        let SubmitFormInput {
            form_id,
            respondent,
            fields,
        } = input;

        let form_id = FormId::from(form_id);
        let fields = fields
            .into_iter()
            .map(FormFieldResponse::try_from)
            .collect::<Result<Vec<_>>>()
            .context("invalid field")
            .into_field_result()?;

        let services = ctx.services();
        let ctx = EntityContext::new(services);

        let mut response = Record::new({
            FormResponse::builder()
                .form_id(form_id)
                .respondent(respondent)
                .fields(fields)
                .build()
        });
        response
            .save(&ctx)
            .await
            .context("failed to save response")
            .into_field_result()?;

        let payload = SubmitFormPayload { ok: true };
        Ok(payload)
    }

    async fn delete_form(
        &self,
        ctx: &Context<'_>,
        input: DeleteFormInput,
        secret: String,
    ) -> FieldResult<DeleteFormPayload> {
        let services = ctx.services();
        let settings = services.settings();
        let ctx = EntityContext::new(services.clone());

        if secret != settings.api_secret {
            let error = FieldError::new("incorrect secret");
            return Err(error);
        }

        let DeleteFormInput { form_id } = input;
        let form_id = FormId::from(form_id);

        ctx.transact(|ctx| async move {
            let mut form = Form::get(form_id)
                .load(&ctx)
                .await
                .context("failed to load form")?;
            form.delete(&ctx).await.context("failed to delete form")?;
            Ok(())
        })
        .await
        .into_field_result()?;

        let payload = DeleteFormPayload { ok: true };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct CreateFormInput {
    pub handle: String,
    pub name: String,
    pub description: Option<String>,
    pub fields: Vec<FormFieldInput>,
    pub respondent_label: Option<String>,
    pub respondent_helper: Option<String>,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct FormFieldInput {
    pub question: String,
    pub input: FormFieldInputConfigInput,
}

impl TryFrom<FormFieldInput> for FormField {
    type Error = Error;

    fn try_from(input: FormFieldInput) -> Result<Self, Self::Error> {
        let FormFieldInput { question, input } = input;
        let input = FormFieldInputConfig::try_from(input)
            .context("invalid input config")?;
        let config = FormField { question, input };
        Ok(config)
    }
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct FormFieldInputConfigInput {
    pub text: Option<bool>,
    pub single_choice: Option<FormFieldSingleChoiceInputConfigInput>,
    pub multiple_choice: Option<FormFieldMultipleChoiceInputConfigInput>,
}

impl TryFrom<FormFieldInputConfigInput> for FormFieldInputConfig {
    type Error = Error;

    fn try_from(input: FormFieldInputConfigInput) -> Result<Self, Self::Error> {
        let FormFieldInputConfigInput {
            text,
            single_choice,
            multiple_choice,
        } = input;

        use FormFieldInputConfig::*;
        let config = if text.unwrap_or_default() {
            Text
        } else if let Some(FormFieldSingleChoiceInputConfigInput { options }) =
            single_choice
        {
            SingleChoice { options }
        } else if let Some(FormFieldMultipleChoiceInputConfigInput {
            options,
        }) = multiple_choice
        {
            MultipleChoice { options }
        } else {
            bail!("not configured");
        };

        Ok(config)
    }
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct FormFieldSingleChoiceInputConfigInput {
    pub options: Set<String>,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct FormFieldMultipleChoiceInputConfigInput {
    pub options: Set<String>,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct CreateFormPayload {
    pub form: FormObject,
    pub ok: bool,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct SubmitFormInput {
    pub form_id: Id<Form>,
    pub respondent: String,
    pub fields: Vec<FormFieldResponseInput>,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct FormFieldResponseInput {
    pub text: Option<String>,
    pub single_choice: Option<String>,
    pub multiple_choice: Option<Set<String>>,
}

impl TryFrom<FormFieldResponseInput> for FormFieldResponse {
    type Error = Error;

    fn try_from(input: FormFieldResponseInput) -> Result<Self, Self::Error> {
        use FormFieldResponse::*;
        let FormFieldResponseInput {
            text,
            single_choice,
            multiple_choice,
        } = input;
        let response = if let Some(text) = text {
            Text(text)
        } else if let Some(choice) = single_choice {
            SingleChoice(choice)
        } else if let Some(choice) = multiple_choice {
            MultipleChoice(choice)
        } else {
            bail!("no response");
        };
        Ok(response)
    }
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct SubmitFormPayload {
    pub ok: bool,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct DeleteFormInput {
    pub form_id: Id<Form>,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct DeleteFormPayload {
    pub ok: bool,
}
