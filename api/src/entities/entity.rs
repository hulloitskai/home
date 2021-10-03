use super::prelude::*;

use mongodb::error::Result as DatabaseResult;
use mongodb::SessionCursor;

use mongodb::options::AggregateOptions;
use mongodb::options::CountOptions;
use mongodb::options::FindOneOptions;
use mongodb::options::FindOptions;
use mongodb::options::ReplaceOptions;

#[derive(Debug, Clone, Serialize, Deserialize, Default, Builder)]
pub struct EntityConditions {
    #[builder(default, setter(into))]
    pub id: Option<ObjectId>,
}

impl From<EntityConditions> for Document {
    fn from(conditions: EntityConditions) -> Self {
        let EntityConditions { id } = conditions;

        let mut doc = Document::new();
        if let Some(id) = id {
            doc.insert("_id", id);
        }
        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EntitySorting {
    CreatedAt(SortingOrder),
    UpdatedAt(SortingOrder),
}

impl From<EntitySorting> for Document {
    fn from(sorting: EntitySorting) -> Document {
        use EntitySorting::*;
        match sorting {
            CreatedAt(order) => doc! { "created_at": order },
            UpdatedAt(order) => doc! { "updated_at": order },
        }
    }
}

#[async_trait]
pub trait Entity: Object {
    const COLLECTION_NAME: &'static str;

    type Conditions: Into<Document>;
    type Sorting: Into<Document>;

    fn collection(ctx: &Context) -> Collection<Document> {
        let name = Self::COLLECTION_NAME;
        ctx.services().database.collection(name)
    }

    fn get(key: ObjectKey<Self::Type>) -> FindOneQuery<Self> {
        let ObjectKey { id, .. } = key;
        let filter = doc! { "_id": id };
        FindOneQuery::with_filter(filter)
    }

    fn get_many(keys: Vec<ObjectKey<Self::Type>>) -> FindQuery<Self> {
        let ids: Vec<_> = keys.into_iter().map(|key| key.id).collect();
        let filter = doc! {
            "_id": {
                "$in": ids
            }
        };
        FindQuery::with_filter(filter)
    }

    fn all() -> FindQuery<Self> {
        Self::find(None)
    }

    fn find(
        conditions: impl Into<Option<Self::Conditions>>,
    ) -> FindQuery<Self> {
        FindQuery::new(conditions)
    }

    fn find_one(
        conditions: impl Into<Option<Self::Conditions>>,
    ) -> FindOneQuery<Self> {
        FindOneQuery::new(conditions)
    }

    fn aggregate<T: Object>(
        pipeline: impl IntoIterator<Item = Document>,
    ) -> AggregateQuery<T> {
        let collection = Self::COLLECTION_NAME;
        AggregateQuery::new(collection, pipeline)
    }

    fn aggregate_one<T: Object>(
        pipeline: impl IntoIterator<Item = Document>,
    ) -> AggregateOneQuery<T> {
        let collection = Self::COLLECTION_NAME;
        AggregateOneQuery::new(collection, pipeline)
    }

    async fn count(ctx: &Context) -> Result<u64> {
        let collection = Self::collection(ctx);
        let count = collection.estimated_document_count(None).await?;
        Ok(count)
    }

    fn validate(&self) -> Result<()> {
        Ok(())
    }

    async fn save(&mut self, ctx: &Context) -> Result<()> {
        self.validate()?;
        ctx.with_transaction(|ctx, transaction| async move {
            self.before_save(&ctx).await?;

            let replacement = {
                let mut doc = self.to_document()?;
                if doc.contains_key("updated_at") {
                    doc.insert("updated_at", Utc::now());
                }
                doc
            };
            let query = doc! { "_id": self.id() };
            let collection = Self::collection(&ctx);
            let options = ReplaceOptions::builder().upsert(true).build();

            let mut transaction = transaction.lock().await;
            let session = transaction.session();

            trace!(
                target: "oyster-api::entities",
                collection = collection.name(),
                %query,
                "saving document"
            );
            collection
                .replace_one_with_session(query, replacement, options, session)
                .await?;

            self.after_save(&ctx).await?;
            Ok(())
        })
        .await
    }

    async fn before_save(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn after_save(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn delete(&mut self, ctx: &Context) -> Result<()> {
        ctx.with_transaction(|ctx, transaction| async move {
            self.before_delete(&ctx).await?;

            let query = doc! { "_id": self.id() };
            let collection = Self::collection(&ctx);

            let mut transaction = transaction.lock().await;
            let session = transaction.session();

            trace!(
                target: "oyster-api::entities",
                collection = collection.name(),
                %query,
                "deleting document"
            );
            collection
                .delete_one_with_session(query, None, session)
                .await?;

            self.after_delete(&ctx).await?;
            Ok(())
        })
        .await
    }

    async fn before_delete(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn after_delete(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct FindOneQuery<T: Entity>(FindOneQueryInner<T>);

impl<T: Entity> FindOneQuery<T> {
    pub fn new(conditions: impl Into<Option<T::Conditions>>) -> Self {
        let inner = FindOneQueryInner::new(conditions);
        Self(inner)
    }

    fn with_filter(filter: impl Into<Option<Document>>) -> Self {
        let inner = FindOneQueryInner::with_filter(filter);
        Self(inner)
    }

    pub fn optional(self) -> MaybeFindOneQuery<T> {
        let Self(inner) = self;
        MaybeFindOneQuery(inner)
    }

    pub async fn load(self, ctx: &Context) -> Result<T> {
        self.0.load(ctx).await?.context("not found")
    }

    pub async fn exists(self, ctx: &Context) -> Result<bool> {
        self.0.exists(ctx).await
    }
}

#[derive(Debug, Clone)]
pub struct MaybeFindOneQuery<T: Entity>(FindOneQueryInner<T>);

impl<T: Entity> MaybeFindOneQuery<T> {
    pub fn new(conditions: impl Into<Option<T::Conditions>>) -> Self {
        let inner = FindOneQueryInner::new(conditions);
        Self(inner)
    }

    fn with_filter(filter: impl Into<Option<Document>>) -> Self {
        let inner = FindOneQueryInner::with_filter(filter);
        Self(inner)
    }

    pub fn required(self) -> FindOneQuery<T> {
        let Self(inner) = self;
        FindOneQuery(inner)
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<T>> {
        self.0.load(ctx).await
    }

    pub async fn exists(self, ctx: &Context) -> Result<bool> {
        self.0.exists(ctx).await
    }
}

#[derive(Debug, Clone)]
struct FindOneQueryInner<T: Entity> {
    filter: Option<Document>,
    options: FindOneOptions,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindOneQueryInner<T> {
    pub fn new(conditions: impl Into<Option<T::Conditions>>) -> Self {
        let conditions: Option<_> = conditions.into();
        let filter: Option<Document> = conditions.map(Into::into);
        Self::with_filter(filter)
    }

    fn with_filter(filter: impl Into<Option<Document>>) -> Self {
        Self {
            filter: filter.into(),
            options: default(),
            phantom: default(),
        }
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<T>> {
        let Self {
            filter, options, ..
        } = self;
        let collection = T::collection(ctx);

        let doc = if let Some(transaction) = ctx.transaction() {
            let mut transaction = transaction.lock().await;
            let session = transaction.session();
            {
                let options = {
                    let options = FindOptions::from(options.clone());
                    to_document(&options).unwrap()
                };
                if let Some(filter) = &filter {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        session = %session.id(),
                        %filter,
                        %options,
                        "finding document"
                    );
                } else {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        session = %session.id(),
                        %options,
                        "finding a document"
                    );
                }
            }
            collection
                .find_one_with_session(filter, options, session)
                .await?
        } else {
            {
                let options = {
                    let options = FindOptions::from(options.clone());
                    to_document(&options).unwrap()
                };
                if let Some(filter) = &filter {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        %filter,
                        %options,
                        "finding document"
                    );
                } else {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        %options,
                        "finding a document"
                    );
                }
            }
            collection.find_one(filter, options).await?
        };

        let doc = match doc {
            Some(doc) => doc,
            None => return Ok(None),
        };

        let entity = T::from_document(doc)?;
        Ok(Some(entity))
    }

    pub async fn exists(self, ctx: &Context) -> Result<bool> {
        let Self { filter, .. } = self;
        let collection = T::collection(ctx);
        let count = collection.count_documents(filter, None).await?;
        Ok(count > 0)
    }
}

pub struct FindQuery<T: Entity> {
    filter: Option<Document>,
    options: FindOptions,
    phantom: PhantomData<T>,
}

fn filter_has_operator(filter: &Document, operator: &str) -> bool {
    for (key, value) in filter {
        if key.starts_with('$') {
            if key == operator {
                return true;
            }
            if dbg!(filter_value_has_operator(value, operator)) {
                return true;
            }
        }
    }
    false
}

fn filter_value_has_operator(value: &Bson, operator: &str) -> bool {
    use Bson::*;
    match value {
        Document(filter) => dbg!(filter_has_operator(filter, operator)),
        Array(array) => dbg!(filter_array_has_operator(array, operator)),
        _ => false,
    }
}

fn filter_array_has_operator(array: &Vec<Bson>, operator: &str) -> bool {
    for entry in array {
        if filter_value_has_operator(entry, operator) {
            return true;
        }
    }
    false
}

impl<T: Entity> FindQuery<T> {
    pub fn new(conditions: impl Into<Option<T::Conditions>>) -> Self {
        let conditions: Option<_> = conditions.into();
        let filter: Option<Document> = conditions.map(Into::into);
        Self::with_filter(filter)
    }

    fn with_filter(filter: impl Into<Option<Document>>) -> Self {
        let filter: Option<_> = filter.into();
        let options = {
            let mut options = FindOptions::default();
            if let Some(filter) = &filter {
                if filter_has_operator(filter, "$text") {
                    let sort = doc! { "score": { "$meta": "textScore" } };
                    options.sort = Some(sort);
                }
            }
            options
        };
        Self {
            filter,
            options,
            phantom: default(),
        }
    }

    pub fn and(mut self, conditions: impl Into<Option<T::Conditions>>) -> Self {
        let conditions: Option<_> = conditions.into();
        let incoming: Option<Document> = conditions.map(Into::into);
        if let Some(incoming) = incoming {
            let filter = match self.filter {
                Some(existing) => {
                    doc! {
                        "$and": [existing, incoming],
                    }
                }
                None => incoming,
            };
            self.filter = Some(filter);
        }
        self
    }

    pub fn skip(mut self, n: impl Into<Option<u32>>) -> Self {
        let n: Option<u32> = n.into();
        self.options.skip = n.map(Into::into);
        self
    }

    pub fn take(mut self, n: impl Into<Option<u32>>) -> Self {
        let n: Option<u32> = n.into();
        self.options.limit = n.map(Into::into);
        self
    }

    pub fn sort(mut self, sorting: impl Into<Option<T::Sorting>>) -> Self {
        let existing = self.options.sort.take();
        let incoming: Option<_> = sorting.into();
        self.options.sort = match incoming {
            Some(incoming) => {
                let incoming: Document = incoming.into();
                let combined = match existing {
                    Some(mut existing) => {
                        existing.extend(incoming);
                        existing
                    }
                    None => incoming,
                };
                Some(combined)
            }
            None => existing,
        };
        self
    }

    pub async fn load<'a>(
        self,
        ctx: &Context,
    ) -> Result<impl Stream<Item = Result<T>>> {
        let Self {
            filter, options, ..
        } = self;
        let collection = T::collection(ctx);

        let cursor: Box<
            dyn Stream<Item = DatabaseResult<Document>> + Send + Unpin,
        > = if let Some(transaction) = ctx.transaction() {
            let cursor = {
                let mut transaction = transaction.lock().await;
                let session = transaction.session();
                if let Some(filter) = &filter {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        session = %session.id(),
                        %filter,
                        options = %to_document(&options).unwrap(),
                        "finding documents"
                    );
                } else {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        session = %session.id(),
                        options = %to_document(&options).unwrap(),
                        "finding all documents"
                    );
                }
                collection
                    .find_with_session(filter, options, session)
                    .await?
            };
            let cursor = TransactionCursor::new(cursor, transaction);
            Box::new(cursor)
        } else {
            if let Some(filter) = &filter {
                trace!(
                    target: "oyster-api::entities",
                    collection = collection.name(),
                    %filter,
                    options = %to_document(&options).unwrap(),
                    "finding documents"
                );
            } else {
                trace!(
                    target: "oyster-api::entities",
                    collection = collection.name(),
                    options = %to_document(&options).unwrap(),
                    "finding all documents"
                );
            }
            let cursor = collection.find(filter, options).await?;
            Box::new(cursor)
        };

        let stream = cursor.map(|doc| -> Result<T> {
            let doc = match doc {
                Ok(doc) => doc,
                Err(error) => return Err(error.into()),
            };
            let entity = T::from_document(doc)?;
            Ok(entity)
        });
        Ok(stream)
    }

    pub async fn count(self, ctx: &Context) -> Result<u64> {
        let Self {
            filter,
            options: find_options,
            ..
        } = self;
        let collection = T::collection(ctx);
        let options = {
            let FindOptions {
                limit,
                skip,
                collation,
                ..
            } = find_options.clone();
            CountOptions::builder()
                .limit(limit.map(|limit| limit as u64))
                .skip(skip)
                .collation(collation)
                .build()
        };

        let count = if let Some(transaction) = ctx.transaction() {
            let mut transaction = transaction.lock().await;
            let session = transaction.session();
            {
                let options = to_document(&find_options).unwrap();
                if let Some(filter) = &filter {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        session = %session.id(),
                        %filter,
                        %options,
                        "counting documents"
                    );
                } else {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        session = %session.id(),
                        %options,
                        "counting documents"
                    );
                }
            }
            collection
                .count_documents_with_session(filter, options, session)
                .await?
        } else {
            {
                let options = to_document(&find_options).unwrap();
                if let Some(filter) = &filter {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        %filter,
                        %options,
                        "counting documents"
                    );
                } else {
                    trace!(
                        target: "oyster-api::entities",
                        collection = collection.name(),
                        %options,
                        "counting documents"
                    );
                }
            }
            collection.count_documents(filter, None).await?
        };

        Ok(count)
    }
}

#[derive(Debug, Clone)]
pub struct AggregateOneQuery<T: Object>(AggregateOneQueryInner<T>);

impl<T: Object> AggregateOneQuery<T> {
    pub fn new(
        collection: &str,
        pipeline: impl IntoIterator<Item = Document>,
    ) -> Self {
        let inner = AggregateOneQueryInner::new(collection, pipeline);
        Self(inner)
    }

    pub fn optional(self) -> MaybeAggregateOneQuery<T> {
        let Self(inner) = self;
        MaybeAggregateOneQuery(inner)
    }

    pub async fn load(self, ctx: &Context) -> Result<T> {
        self.0.load(ctx).await?.context("not found")
    }
}

#[derive(Debug, Clone)]
pub struct MaybeAggregateOneQuery<T: Object>(AggregateOneQueryInner<T>);

impl<T: Object> MaybeAggregateOneQuery<T> {
    pub fn new(
        collection: &str,
        pipeline: impl IntoIterator<Item = Document>,
    ) -> Self {
        let inner = AggregateOneQueryInner::new(collection, pipeline);
        Self(inner)
    }

    pub fn required(self) -> AggregateOneQuery<T> {
        let Self(inner) = self;
        AggregateOneQuery(inner)
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<T>> {
        self.0.load(ctx).await
    }
}

#[derive(Debug, Clone)]
struct AggregateOneQueryInner<T: Object> {
    collection: String,
    pipeline: Vec<Document>,
    options: AggregateOptions,
    phantom: PhantomData<T>,
}

impl<T: Object> AggregateOneQueryInner<T> {
    pub fn new(
        collection: &str,
        pipeline: impl IntoIterator<Item = Document>,
    ) -> Self {
        let options = AggregateOptions::default();
        let pipeline = Vec::from_iter(pipeline);
        Self {
            collection: collection.to_owned(),
            pipeline,
            options,
            phantom: default(),
        }
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<T>> {
        let Self {
            collection,
            options,
            mut pipeline,
            ..
        } = self;

        pipeline.push(doc! {
            "$limit": 1
        });

        let collection: Collection<Document> =
            ctx.services().database.collection(&collection);
        let mut cursor: Box<
            dyn Stream<Item = DatabaseResult<Document>> + Send + Unpin,
        > = if let Some(transaction) = ctx.transaction() {
            let cursor = {
                let mut transaction = transaction.lock().await;
                let session = transaction.session();
                trace!(
                    target: "oyster-api::entities",
                    collection = collection.name(),
                    session = %session.id(),
                    pipeline = %bson!(pipeline.clone()),
                    "aggregating documents"
                );
                collection
                    .aggregate_with_session(pipeline, options, session)
                    .await?
            };
            let cursor = TransactionCursor::new(cursor, transaction);
            Box::new(cursor)
        } else {
            trace!(
                target: "oyster-api::entities",
                collection = collection.name(),
                pipeline = %bson!(pipeline.clone()),
                "aggregating documents"
            );
            let cursor = collection.aggregate(pipeline, options).await?;
            Box::new(cursor)
        };

        let doc = cursor.next().await;
        let doc = match doc {
            Some(doc) => doc?,
            None => return Ok(None),
        };

        let entity = T::from_document(doc)?;
        Ok(Some(entity))
    }
}

#[derive(Debug, Clone)]
pub struct AggregateQuery<T> {
    collection: String,
    pipeline: Vec<Document>,
    options: AggregateOptions,
    skip: Option<u32>,
    take: Option<u32>,
    phantom: PhantomData<T>,
}

impl<T: Object> AggregateQuery<T> {
    pub fn new(
        collection: &str,
        pipeline: impl IntoIterator<Item = Document>,
    ) -> Self {
        let options = AggregateOptions::default();
        let pipeline = Vec::from_iter(pipeline);
        Self {
            collection: collection.to_owned(),
            pipeline,
            options,
            skip: default(),
            take: default(),
            phantom: default(),
        }
    }

    pub fn skip(mut self, n: impl Into<Option<u32>>) -> Self {
        self.skip = n.into();
        self
    }

    pub fn take(mut self, n: impl Into<Option<u32>>) -> Self {
        self.take = n.into();
        self
    }

    pub async fn load<'a>(
        self,
        ctx: &Context,
    ) -> Result<impl Stream<Item = Result<T>>> {
        let Self {
            collection,
            mut pipeline,
            options,
            skip,
            take,
            ..
        } = self;

        if let Some(skip) = skip {
            pipeline.push(doc! {
                "$skip": skip
            });
        }
        if let Some(take) = take {
            pipeline.push(doc! {
                "$limit": take
            });
        }

        let collection: Collection<Document> =
            ctx.services().database.collection(&collection);
        let cursor: Box<
            dyn Stream<Item = DatabaseResult<Document>> + Send + Unpin,
        > = if let Some(transaction) = ctx.transaction() {
            let cursor = {
                let mut transaction = transaction.lock().await;
                let session = transaction.session();
                trace!(
                    target: "oyster-api::entities",
                    collection = collection.name(),
                    session = %session.id(),
                    pipeline = %bson!(pipeline.clone()),
                    ?options,
                    "aggregating documents"
                );
                collection
                    .aggregate_with_session(pipeline, options, session)
                    .await?
            };
            let cursor = TransactionCursor::new(cursor, transaction);
            Box::new(cursor)
        } else {
            trace!(
                target: "oyster-api::entities",
                collection = collection.name(),
                pipeline = %bson!(pipeline.clone()),
                ?options,
                "aggregating documents"
            );
            let cursor = collection.aggregate(pipeline, options).await?;
            Box::new(cursor)
        };

        let stream = cursor.map(|doc| -> Result<T> {
            let doc = match doc {
                Ok(doc) => doc,
                Err(error) => return Err(error.into()),
            };
            let entity = T::from_document(doc)?;
            Ok(entity)
        });
        Ok(stream)
    }

    pub async fn count<'a>(self, ctx: &Context) -> Result<u64> {
        let Self {
            collection,
            mut pipeline,
            options,
            skip,
            take,
            ..
        } = self;

        if let Some(skip) = skip {
            pipeline.push(doc! {
                "$skip": skip
            });
        }
        if let Some(take) = take {
            pipeline.push(doc! {
                "$limit": take
            });
        }
        pipeline.push(doc! {
            "$count": "_count"
        });

        let collection: Collection<Document> =
            ctx.services().database.collection(&collection);
        let result: Document = if let Some(transaction) = ctx.transaction() {
            let mut transaction = transaction.lock().await;
            let session = transaction.session();
            trace!(
                target: "oyster-api::entities",
                collection = collection.name(),
                session = %session.id(),
                pipeline = %bson!(pipeline.clone()),
                ?options,
                "counting aggregated documents"
            );
            let mut cursor = {
                collection
                    .aggregate_with_session(pipeline, options, session)
                    .await?
            };
            cursor.next(session).await.unwrap()?
        } else {
            trace!(
                target: "oyster-api::entities",
                collection = collection.name(),
                pipeline = %bson!(pipeline.clone()),
                ?options,
                "counting aggregated documents"
            );
            let mut cursor = collection.aggregate(pipeline, options).await?;
            cursor.next().await.unwrap()?
        };

        let count = result.get_i64("_count").unwrap();
        let count = u64::try_from(count).unwrap();
        Ok(count)
    }
}

#[pin_project]
#[derive(Debug)]
struct TransactionCursor<T>
where
    T: DeserializeOwned + Unpin,
    T: Send + Sync,
{
    cursor: SessionCursor<T>,
    transaction: Arc<Mutex<Transaction>>,
}

impl<T> TransactionCursor<T>
where
    T: DeserializeOwned + Unpin,
    T: Send + Sync,
{
    fn new(
        cursor: SessionCursor<T>,
        transaction: Arc<Mutex<Transaction>>,
    ) -> Self {
        Self {
            cursor,
            transaction,
        }
    }

    async fn next(self: Pin<&mut Self>) -> Option<DatabaseResult<T>> {
        let projection = self.project();
        let mut transaction = projection.transaction.lock().await;
        let session = transaction.session();
        projection.cursor.next(session).await
    }
}

impl<T> Stream for TransactionCursor<T>
where
    T: DeserializeOwned + Unpin,
    T: Send + Sync,
{
    type Item = DatabaseResult<T>;

    fn poll_next(
        self: Pin<&mut Self>,
        cx: &mut TaskContext<'_>,
    ) -> TaskPoll<Option<Self::Item>> {
        let future = self.next();
        pin_mut!(future);
        future.poll(cx)
    }
}
