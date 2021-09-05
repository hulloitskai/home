use super::prelude::*;

use mongodb::error::Result as DatabaseResult;
use mongodb::SessionCursor;

use mongodb::options::AggregateOptions;
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
        FindOneQuery::new_untyped(filter)
    }

    fn get_many(keys: Vec<ObjectKey<Self::Type>>) -> FindQuery<Self> {
        let ids: Vec<_> = keys
            .into_iter()
            .map(|key| {
                let ObjectKey { id, .. } = key;
                id
            })
            .collect();
        let filter = doc! { "_id": { "$in": ids } };
        FindQuery::new_untyped(filter)
    }

    fn all() -> FindQuery<Self> {
        let filter = Document::new();
        FindQuery::new_untyped(filter)
    }

    async fn count(ctx: &Context) -> Result<u64> {
        let collection = Self::collection(ctx);
        let count = collection.estimated_document_count(None).await?;
        Ok(count)
    }

    fn find(conditions: Self::Conditions) -> FindQuery<Self> {
        FindQuery::new(conditions)
    }

    fn find_one(conditions: Self::Conditions) -> FindOneQuery<Self> {
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

    fn validate(&self) -> Result<()> {
        Ok(())
    }

    async fn save(&mut self, ctx: &Context) -> Result<()> {
        self.validate()?;
        ctx.transact(|ctx| async move {
            self.before_save(&ctx).await?;

            let replacement = {
                let mut doc = self.to_document()?;
                if doc.contains_key("updated_at") {
                    doc.insert("updated_at", Utc::now());
                }
                doc
            };
            let query = doc! { "_id": self.id() };
            let options = ReplaceOptions::builder().upsert(true).build();

            let collection = Self::collection(&ctx);
            let mut transaction = ctx
                .lock_transaction()
                .await
                .expect("transaction should have started");
            let session = transaction.session();
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
        ctx.transact(|ctx| async move {
            self.before_delete(&ctx).await?;

            let query = doc! { "_id": self.id() };
            let collection = Self::collection(&ctx);
            let mut transaction = ctx
                .lock_transaction()
                .await
                .expect("transaction should have started");
            let session = transaction.session();
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
    pub fn new(conditions: T::Conditions) -> Self {
        let inner = FindOneQueryInner::new(conditions);
        Self(inner)
    }

    fn new_untyped(filter: Document) -> Self {
        let inner = FindOneQueryInner::new_untyped(filter);
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
    pub fn new(conditions: T::Conditions) -> Self {
        let inner = FindOneQueryInner::new(conditions);
        Self(inner)
    }

    fn new_untyped(filter: Document) -> Self {
        let inner = FindOneQueryInner::new_untyped(filter);
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
    filter: Document,
    options: FindOneOptions,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindOneQueryInner<T> {
    pub fn new(conditions: T::Conditions) -> Self {
        Self::new_untyped(conditions.into())
    }

    fn new_untyped(filter: Document) -> Self {
        Self {
            filter,
            options: FindOneOptions::default(),
            phantom: PhantomData,
        }
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<T>> {
        let Self {
            filter, options, ..
        } = self;

        let collection = T::collection(ctx);
        let doc = if let Some(mut transaction) = ctx.lock_transaction().await {
            let session = transaction.session();
            collection
                .find_one_with_session(filter, options, session)
                .await?
        } else {
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
    filter: Document,
    options: FindOptions,
    phantom: PhantomData<T>,
}

impl<T: Entity> FindQuery<T> {
    pub fn new(conditions: T::Conditions) -> Self {
        Self::new_untyped(conditions.into())
    }

    fn new_untyped(filter: Document) -> Self {
        let mut options = FindOptions::default();
        if filter.get("$text").is_some() {
            let sort = doc! { "score": { "$meta": "textScore" } };
            options.sort = Some(sort);
        }
        Self {
            filter,
            options,
            phantom: default(),
        }
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
        self.options.sort = incoming.map(|incoming| {
            let incoming: Document = incoming.into();
            match existing {
                Some(mut existing) => {
                    for (key, value) in incoming {
                        existing.insert(key, value);
                    }
                    existing
                }
                None => incoming,
            }
        });
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
                collection
                    .find_with_session(filter, options, session)
                    .await?
            };
            let cursor = TransactionCursor::new(cursor, transaction);
            Box::new(cursor)
        } else {
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
        let Self { filter, .. } = self;
        let collection = T::collection(ctx);
        let count = collection.count_documents(filter, None).await?;
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
        let pipeline: Vec<_> = pipeline.into_iter().collect();
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
            mut pipeline,
            options,
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
                collection
                    .aggregate_with_session(pipeline, options, session)
                    .await?
            };
            let cursor = TransactionCursor::new(cursor, transaction);
            Box::new(cursor)
        } else {
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
        let pipeline: Vec<_> = pipeline.into_iter().collect();
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
                collection
                    .aggregate_with_session(pipeline, options, session)
                    .await?
            };
            let cursor = TransactionCursor::new(cursor, transaction);
            Box::new(cursor)
        } else {
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
            let mut cursor = collection
                .aggregate_with_session(pipeline, options, session)
                .await?;
            cursor.next(session).await.unwrap()?
        } else {
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
    transaction: Arc<AsyncMutex<Transaction>>,
}

impl<T> TransactionCursor<T>
where
    T: DeserializeOwned + Unpin,
    T: Send + Sync,
{
    fn new(
        cursor: SessionCursor<T>,
        transaction: Arc<AsyncMutex<Transaction>>,
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
