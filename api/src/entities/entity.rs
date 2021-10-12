use super::prelude::*;

use mongodb::error::Result as DatabaseResult;
use mongodb::SessionCursor;

use mongodb::options::AggregateOptions;
use mongodb::options::CountOptions;
use mongodb::options::FindOneOptions;
use mongodb::options::FindOptions;

#[async_trait]
pub trait Entity: Object + Send + Sync {
    const NAME: &'static str;

    type Id: EntityId;
    type Conditions: Into<Document>;
    type Sorting: Into<Document>;

    fn collection(ctx: &Context) -> Collection<Document> {
        let name = Self::NAME;
        ctx.services().database.collection(name)
    }

    fn get(id: Self::Id) -> FindOneQuery<Self> {
        let id: ObjectId = id.into();
        let filter = doc! { "_id": id };
        FindOneQuery::from_filter(filter)
    }

    fn get_many(ids: impl IntoIterator<Item = ObjectId>) -> FindQuery<Self> {
        let ids = Bson::from_iter(ids);
        let filter = doc! { "_id": { "$in": ids } };
        FindQuery::from_filter(filter)
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

    fn aggregate(
        pipeline: impl IntoIterator<Item = Document>,
    ) -> AggregateQuery {
        let collection = Self::NAME;
        AggregateQuery::new(collection, pipeline)
    }

    fn aggregate_one(
        pipeline: impl IntoIterator<Item = Document>,
    ) -> AggregateOneQuery {
        let collection = Self::NAME;
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

    async fn before_save(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn before_delete(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn after_save(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }

    async fn after_delete(&mut self, _: &Context) -> Result<()> {
        Ok(())
    }
}

pub trait EntityId
where
    Self: Debug,
    Self: Clone,
    Self: Into<ObjectId> + From<ObjectId>,
{
    type Entity: Entity;
}

impl<Id: EntityId> From<Id> for GlobalId {
    fn from(id: Id) -> Self {
        let namespace = Id::Entity::NAME;
        let id: ObjectId = id.into();
        GlobalId {
            namespace: namespace.to_owned(),
            id,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EntityMeta<T: Entity> {
    pub id: T::Id,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

impl<T: Entity> EntityMeta<T> {
    pub fn new() -> Self {
        let id: T::Id = ObjectId::new().into();
        let created_at = now();
        let updated_at = created_at.clone();

        Self {
            id,
            created_at,
            updated_at,
        }
    }
}

impl<T: Entity> Default for EntityMeta<T> {
    fn default() -> Self {
        Self::new()
    }
}

impl<T: Entity> Clone for EntityMeta<T> {
    fn clone(&self) -> Self {
        let Self {
            id,
            created_at,
            updated_at,
        } = self;
        Self {
            id: id.clone(),
            created_at: created_at.clone(),
            updated_at: updated_at.clone(),
        }
    }
}

impl<T: Entity> Object for EntityMeta<T> {
    fn to_document(&self) -> Result<Document> {
        let Self {
            id,
            created_at,
            updated_at,
        } = self.to_owned();
        let id: ObjectId = id.into();

        let doc = doc! {
            "_id": id,
            "_created_at": BsonDateTime::from(created_at),
            "_updated_at": BsonDateTime::from(updated_at),
        };
        Ok(doc)
    }

    fn from_document(doc: Document) -> Result<Self> {
        let id = doc
            .get_object_id("_id")
            .context("failed to get _id field")?;
        let created_at = doc
            .get_datetime("_created_at")
            .context("failed to get _created_at field")?;
        let updated_at = doc
            .get_datetime("_updated_at")
            .context("failed to get _updated_at field")?;
        let meta = EntityMeta {
            id: id.into(),
            created_at: created_at.to_chrono(),
            updated_at: updated_at.to_chrono(),
        };
        Ok(meta)
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EmptyConditions;

impl From<EmptyConditions> for Document {
    fn from(_: EmptyConditions) -> Self {
        Self::default()
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EmptySorting;

impl From<EmptySorting> for Document {
    fn from(_: EmptySorting) -> Self {
        Self::default()
    }
}

#[derive(Debug, Clone)]
pub struct FindOneQuery<T: Entity>(FindOneQueryInner<T>);

impl<T: Entity> FindOneQuery<T> {
    pub fn new(conditions: impl Into<Option<T::Conditions>>) -> Self {
        let inner = FindOneQueryInner::new(conditions);
        Self(inner)
    }

    fn from_filter(filter: impl Into<Option<Document>>) -> Self {
        let inner = FindOneQueryInner::from_filter(filter);
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

    fn from_filter(filter: impl Into<Option<Document>>) -> Self {
        let inner = FindOneQueryInner::from_filter(filter);
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
        Self::from_filter(filter)
    }

    fn from_filter(filter: impl Into<Option<Document>>) -> Self {
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
        Self::from_filter(filter)
    }

    fn from_filter(filter: impl Into<Option<Document>>) -> Self {
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
    ) -> Result<impl Stream<Item = Result<Record<T>>>> {
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

        let stream = cursor.map(|doc| -> Result<_> {
            let doc = match doc {
                Ok(doc) => doc,
                Err(error) => return Err(error.into()),
            };
            let record = Record::<T>::from_document(doc)?;
            Ok(record)
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
pub struct AggregateOneQuery(AggregateOneQueryInner);

impl AggregateOneQuery {
    pub fn new(
        collection: &str,
        pipeline: impl IntoIterator<Item = Document>,
    ) -> Self {
        let inner = AggregateOneQueryInner::new(collection, pipeline);
        Self(inner)
    }

    pub fn optional(self) -> MaybeAggregateOneQuery {
        let Self(inner) = self;
        MaybeAggregateOneQuery(inner)
    }

    pub async fn load(self, ctx: &Context) -> Result<Document> {
        self.0.load(ctx).await?.context("not found")
    }
}

#[derive(Debug, Clone)]
pub struct MaybeAggregateOneQuery(AggregateOneQueryInner);

impl MaybeAggregateOneQuery {
    pub fn new(
        collection: &str,
        pipeline: impl IntoIterator<Item = Document>,
    ) -> Self {
        let inner = AggregateOneQueryInner::new(collection, pipeline);
        Self(inner)
    }

    pub fn required(self) -> AggregateOneQuery {
        let Self(inner) = self;
        AggregateOneQuery(inner)
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<Document>> {
        self.0.load(ctx).await
    }
}

#[derive(Debug, Clone)]
struct AggregateOneQueryInner {
    collection: String,
    pipeline: Vec<Document>,
    options: AggregateOptions,
}

impl AggregateOneQueryInner {
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
        }
    }

    pub async fn load(self, ctx: &Context) -> Result<Option<Document>> {
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
        doc.transpose().map_err(Into::into)
    }
}

#[derive(Debug, Clone)]
pub struct AggregateQuery {
    collection: String,
    pipeline: Vec<Document>,
    options: AggregateOptions,
    skip: Option<u32>,
    take: Option<u32>,
}

impl AggregateQuery {
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
    ) -> Result<impl Stream<Item = Result<Document>>> {
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

        let stream =
            cursor.map(|doc| -> Result<Document> { doc.map_err(Into::into) });
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
