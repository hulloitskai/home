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
        self.record.created_at().into()
    }

    async fn updated_at(&self) -> DateTimeScalar {
        self.record.updated_at().into()
    }

    async fn archived_at(&self) -> Option<DateTimeScalar> {
        self.record.deleted_at().map(Into::into)
    }

    async fn is_archived(&self) -> bool {
        self.record.is_deleted()
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

    async fn respondent_label(&self) -> Option<&str> {
        self.record.respondent_label.as_deref()
    }

    async fn respondent_helper(&self) -> Option<&str> {
        self.record.respondent_helper.as_deref()
    }

    async fn fields(&self) -> Vec<FormFieldObject> {
        self.record.fields.iter().cloned().map(Into::into).collect()
    }

    async fn responses(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Vec<FormResponseObject>> {
        self.resolve_responses(ctx).await.map_err(format_error)
    }

    async fn responses_count(&self, ctx: &Context<'_>) -> FieldResult<u64> {
        self.resolve_responses_count(ctx)
            .await
            .map_err(format_error)
    }
}

impl FormObject {
    async fn resolve_responses(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Vec<FormResponseObject>> {
        let identity = ctx.identity();
        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());

        if let Some(identity) = identity {
            ensure!(identity.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }

        let responses = Form::responses(&self.record)
            .load(&ctx)
            .await
            .context("failed to find responses")?;
        let responses = responses
            .try_collect::<Vec<_>>()
            .await
            .context("failed to load responses")?;
        let responses = responses
            .into_iter()
            .map(FormResponseObject::from)
            .collect::<Vec<_>>();
        Ok(responses)
    }
    async fn resolve_responses_count(&self, ctx: &Context<'_>) -> Result<u64> {
        let identity = ctx.identity();
        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());

        if let Some(identity) = identity {
            ensure!(identity.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }

        let count = Form::responses(&self.record)
            .count(&ctx)
            .await
            .context("failed to count responses")?;
        Ok(count)
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

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct FormQuery;

#[Object]
impl FormQuery {
    async fn form(
        &self,
        ctx: &Context<'_>,
        id: Id<Form>,
    ) -> FieldResult<Option<FormObject>> {
        self.resolve_form(ctx, id).await.map_err(format_error)
    }

    async fn form_by_handle(
        &self,
        ctx: &Context<'_>,
        handle: String,
    ) -> FieldResult<Option<FormObject>> {
        self.resolve_form_by_handle(ctx, handle)
            .await
            .map_err(format_error)
    }

    async fn forms(
        &self,
        ctx: &Context<'_>,
        #[graphql(default)] skip: u64,
        #[graphql(default = 25)] take: u64,
        #[graphql(default = false)] include_archived: bool,
    ) -> FieldResult<Vec<FormObject>> {
        self.resolve_forms(ctx, skip, take, include_archived)
            .await
            .map_err(format_error)
    }
}

impl FormQuery {
    async fn resolve_form(
        &self,
        ctx: &Context<'_>,
        id: Id<Form>,
    ) -> Result<Option<FormObject>> {
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        let form_id = FormId::from(id);
        let form = Form::get(form_id)
            .optional()
            .load(&ctx)
            .await
            .context("failed to load form")?;

        let form = form.map(FormObject::from);
        Ok(form)
    }

    async fn resolve_form_by_handle(
        &self,
        ctx: &Context<'_>,
        handle: String,
    ) -> Result<Option<FormObject>> {
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        let handle =
            Handle::from_str(&handle).context("failed to parse handle")?;
        let form = Form::find_one({
            FormConditions::builder().handle(handle).build()
        })
        .optional()
        .load(&ctx)
        .await
        .context("failed to load form")?;

        let form = form.map(FormObject::from);
        Ok(form)
    }

    async fn resolve_forms(
        &self,
        ctx: &Context<'_>,
        skip: u64,
        take: u64,
        include_archived: bool,
    ) -> Result<Vec<FormObject>> {
        let identity = ctx.identity();
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        if let Some(identity) = identity {
            ensure!(identity.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }
        ensure!(take <= 25, "can only take up to 25 forms");

        let forms = if include_archived {
            Form::with_deleted()
        } else {
            Form::all()
        };
        let forms = forms
            .skip(skip)
            .take(take)
            .load(&ctx)
            .await
            .context("failed to find forms")?;
        let forms = forms
            .try_collect::<Vec<_>>()
            .await
            .context("failed to load forms")?;

        let forms = forms.into_iter().map(FormObject::from).collect::<Vec<_>>();
        Ok(forms)
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct FormMutation;

#[Object]
impl FormMutation {
    async fn create_form(
        &self,
        ctx: &Context<'_>,
        input: CreateFormInput,
    ) -> FieldResult<CreateFormPayload> {
        self.resolve_create_form(ctx, input)
            .await
            .map_err(format_error)
    }

    async fn submit_form(
        &self,
        ctx: &Context<'_>,
        input: SubmitFormInput,
    ) -> FieldResult<SubmitFormPayload> {
        self.resolve_submit_form(ctx, input)
            .await
            .map_err(format_error)
    }

    async fn delete_form(
        &self,
        ctx: &Context<'_>,
        input: DeleteFormInput,
    ) -> FieldResult<DeleteFormPayload> {
        self.resolve_delete_form(ctx, input)
            .await
            .map_err(format_error)
    }

    async fn archive_form(
        &self,
        ctx: &Context<'_>,
        input: ArchiveFormInput,
    ) -> FieldResult<ArchiveFormPayload> {
        self.resolve_archive_form(ctx, input)
            .await
            .map_err(format_error)
    }
}

impl FormMutation {
    async fn resolve_create_form(
        &self,
        ctx: &Context<'_>,
        input: CreateFormInput,
    ) -> Result<CreateFormPayload> {
        let identity = ctx.identity();
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        if let Some(identity) = identity {
            ensure!(identity.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }

        let CreateFormInput {
            handle,
            name,
            description,
            fields,
            respondent_label,
            respondent_helper,
        } = input;
        let handle =
            Handle::from_str(&handle).context("failed to parse handle")?;
        let fields = fields
            .into_iter()
            .map(FormField::try_from)
            .collect::<Result<Vec<_>>>()
            .context("invalid form field")?;

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
        form.save(&ctx).await.context("failed to save form")?;

        let form = FormObject::from(form);
        let payload = CreateFormPayload { form, ok: true };
        Ok(payload)
    }

    async fn resolve_submit_form(
        &self,
        ctx: &Context<'_>,
        input: SubmitFormInput,
    ) -> Result<SubmitFormPayload> {
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        let SubmitFormInput {
            form_id,
            respondent,
            fields,
        } = input;
        let form_id = FormId::from(form_id);
        let fields = fields
            .into_iter()
            .map(FormResponseField::try_from)
            .collect::<Result<Vec<_>>>()
            .context("invalid field")?;

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
            .context("failed to save response")?;

        let response = FormResponseObject::from(response);
        let payload = SubmitFormPayload { ok: true, response };
        Ok(payload)
    }

    async fn resolve_delete_form(
        &self,
        ctx: &Context<'_>,
        input: DeleteFormInput,
    ) -> Result<DeleteFormPayload> {
        let identity = ctx.identity();
        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());

        if let Some(identity) = identity {
            ensure!(identity.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }

        let DeleteFormInput { form_id } = input;
        let form_id = FormId::from(form_id);
        ctx.transact(|ctx| async move {
            let mut form = Form::get(form_id)
                .load(&ctx)
                .await
                .context("failed to load form")?;
            form.destroy(&ctx).await.context("failed to destroy form")?;
            Ok(())
        })
        .await?;

        let payload = DeleteFormPayload { ok: true };
        Ok(payload)
    }

    async fn resolve_archive_form(
        &self,
        ctx: &Context<'_>,
        input: ArchiveFormInput,
    ) -> Result<ArchiveFormPayload> {
        let identity = ctx.identity();
        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());

        if let Some(identity) = identity {
            ensure!(identity.is_admin, "not authorized");
        } else {
            bail!("not authenticated");
        }

        let ArchiveFormInput { form_id } = input;
        let form_id = FormId::from(form_id);
        let form = ctx
            .transact(|ctx| async move {
                let mut form = Form::get(form_id)
                    .load(&ctx)
                    .await
                    .context("failed to load form")?;
                form.delete(&ctx).await?;
                Ok(form)
            })
            .await?;

        let form = FormObject::from(form);
        let payload = ArchiveFormPayload { ok: true, form };
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
    pub ok: bool,
    pub form: FormObject,
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

impl TryFrom<FormFieldResponseInput> for FormResponseField {
    type Error = Error;

    fn try_from(input: FormFieldResponseInput) -> Result<Self, Self::Error> {
        use FormResponseField::*;
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
    pub response: FormResponseObject,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct DeleteFormInput {
    pub form_id: Id<Form>,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct DeleteFormPayload {
    pub ok: bool,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct ArchiveFormInput {
    pub form_id: Id<Form>,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct ArchiveFormPayload {
    pub ok: bool,
    pub form: FormObject,
}
