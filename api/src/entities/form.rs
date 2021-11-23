use entrust::AggregateQuery;

use super::*;

pub type FormId = EntityId<Form>;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Object)]
pub struct Form {
    pub handle: Handle,
    pub name: String,

    #[builder(default)]
    pub description: Option<String>,

    #[builder(default)]
    pub respondent_label: Option<String>,

    #[builder(default)]
    pub respondent_helper: Option<String>,

    pub fields: Vec<FormField>,

    #[builder(default)]
    pub archived_at: Option<DateTime>,
}

impl Form {
    pub fn is_archived(&self) -> bool {
        self.archived_at.is_some()
    }
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

impl Form {
    pub fn responses(record: &Record<Self>) -> FindQuery<FormResponse> {
        FormResponse::find({
            let form_id = record.id();
            FormResponseConditions::builder().form_id(form_id).build()
        })
    }

    pub async fn delete_responses(
        record: &Record<Self>,
        ctx: &Context,
    ) -> Result<Vec<Record<FormResponse>>> {
        ctx.transact(|ctx| async move {
            let responses = Self::responses(record)
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

#[async_trait]
impl Entity for Form {
    const NAME: &'static str = "Form";

    type Services = Services;
    type Conditions = FormConditions;
    type Sorting = EmptySorting;

    async fn before_delete(
        record: &mut Record<Self>,
        ctx: &EntityContext<Self::Services>,
    ) -> Result<()> {
        Self::delete_responses(record, ctx)
            .await
            .context("failed to delete responses")?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct FormConditions {
    #[builder(default, setter(into))]
    pub handle: Option<Handle>,

    #[builder(default, setter(into))]
    pub is_archived: Option<bool>,
}

impl EntityConditions for FormConditions {
    fn into_document(self) -> Document {
        let FormConditions {
            handle,
            is_archived,
        } = self;

        let mut doc = Document::new();
        if let Some(handle) = handle {
            doc.insert("handle", handle);
        }
        if let Some(is_archived) = is_archived {
            use Bson::Null;
            if is_archived {
                doc.insert("archivedAt", doc! { "$ne": Null });
            } else {
                doc.insert("archivedAt", Null);
            }
        }

        doc
    }
}
