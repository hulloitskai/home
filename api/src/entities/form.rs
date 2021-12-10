use super::*;

pub type FormId = EntityId<Form>;

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct Form {
    #[builder(default, setter(skip))]
    pub id: FormId,

    #[builder(default = now(), setter(skip))]
    pub created_at: DateTime,

    #[builder(default, setter(skip))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime>,

    #[builder(default, setter(skip))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub archived_at: Option<DateTime>,

    pub handle: Handle,
    pub name: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default)]
    pub description: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default)]
    pub respondent_label: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    #[builder(default)]
    pub respondent_helper: Option<String>,

    pub fields: Vec<FormField>,
}

impl Form {
    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FormDocument {
    pub _id: ObjectId,

    pub created_at: BsonDateTime,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<BsonDateTime>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub archived_at: Option<BsonDateTime>,

    pub handle: Handle,
    pub name: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub respondent_label: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub respondent_helper: Option<String>,

    pub fields: Vec<FormField>,
}

impl From<Form> for FormDocument {
    fn from(doc: Form) -> Self {
        let Form {
            id,
            created_at,
            updated_at,
            archived_at,
            handle,
            name,
            description,
            respondent_label,
            respondent_helper,
            fields,
        } = doc;

        FormDocument {
            _id: id.into(),
            created_at: BsonDateTime::from_chrono(created_at),
            updated_at: updated_at.map(BsonDateTime::from_chrono),
            archived_at: archived_at.map(BsonDateTime::from_chrono),
            handle,
            name,
            description,
            respondent_label,
            respondent_helper,
            fields,
        }
    }
}

impl From<FormDocument> for Form {
    fn from(doc: FormDocument) -> Self {
        let FormDocument {
            _id,
            created_at,
            updated_at,
            archived_at,
            handle,
            name,
            description,
            respondent_label,
            respondent_helper,
            fields,
        } = doc;

        Form {
            id: _id.into(),
            created_at: created_at.to_chrono(),
            updated_at: updated_at.map(BsonDateTime::to_chrono),
            archived_at: archived_at.map(BsonDateTime::to_chrono),
            handle,
            name,
            description,
            respondent_label,
            respondent_helper,
            fields,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormField {
    pub question: String,
    pub input: FormFieldInputConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormFieldInputConfig {
    Text,
    SingleChoice { options: Set<String> },
    MultipleChoice { options: Set<String> },
}

impl Form {
    pub fn responses(&self) -> FindQuery<FormResponse> {
        FormResponse::find({
            FormResponseConditions::builder().form_id(self.id).build()
        })
    }

    pub async fn delete_responses(
        &self,
        ctx: &Context,
    ) -> Result<Vec<FormResponse>> {
        ctx.transact(|ctx| async move {
            let responses = self
                .responses()
                .load(&ctx)
                .await
                .context("failed to find responses")?;
            let responses: Vec<_> = responses
                .try_collect()
                .await
                .context("failed to load responses")?;
            let responses_futures: Vec<_> = responses
                .into_iter()
                .map(|mut response| {
                    let ctx = ctx.clone();
                    async move {
                        response.delete(&ctx).await.with_context(|| {
                            format!(
                                "failed to delete response {}",
                                response.id()
                            )
                        })?;
                        Ok::<_, Error>(response)
                    }
                })
                .map(|future| async move {
                    let result = spawn(future).await;
                    result.unwrap()
                })
                .collect();
            let responses = try_join_all(responses_futures).await?;
            Ok(responses)
        })
        .await
    }
}

impl Object for Form {
    fn to_document(&self) -> Result<Document> {
        let doc = FormDocument::from(self.to_owned());
        let doc = to_document(&doc)?;
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let doc = from_document::<FormDocument>(doc)?;
        let form = Self::from(doc);
        Ok(form)
    }
}

#[async_trait]
impl Entity for Form {
    const NAME: &'static str = "Form";

    type Services = Services;
    type Conditions = FormConditions;
    type Sorting = FormSorting;

    fn id(&self) -> EntityId<Self> {
        self.id
    }

    fn validate(&self) -> Result<()> {
        let Form { fields, .. } = self;
        ensure!(!fields.is_empty(), "missing fields");
        Ok(())
    }

    async fn before_delete(
        &mut self,
        ctx: &EntityContext<Self::Services>,
    ) -> Result<()> {
        self.delete_responses(ctx)
            .await
            .context("failed to delete responses")?;
        Ok(())
    }
}

impl Updateable for Form {
    fn as_updateable(&self) -> UpdateableView {
        let Form { updated_at, .. } = self;
        UpdateableView { updated_at }
    }

    fn as_updateable_mut(&mut self) -> UpdateableViewMut {
        let Form { updated_at, .. } = self;
        UpdateableViewMut { updated_at }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormConditions {
    #[builder(default, setter(into))]
    pub handle: Option<Handle>,

    #[builder(default)]
    pub include_archived: bool,
}

impl EntityConditions for FormConditions {
    fn to_document(&self) -> Document {
        let FormConditions {
            handle,
            include_archived,
        } = self;

        let mut doc = Document::new();
        if let Some(handle) = handle {
            doc.insert("handle", handle);
        }
        if !include_archived {
            doc.insert("archivedAt", doc! { "$exists": false });
        }

        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormSorting {
    CreatedAt(SortingDirection),
}

impl EntitySorting for FormSorting {
    fn to_document(&self) -> Document {
        use FormSorting::*;
        match self {
            CreatedAt(direction) => doc! { "_createdAt": direction },
        }
    }
}
