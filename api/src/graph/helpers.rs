use super::prelude::*;

#[asyncify]
pub(super) trait ContextExt {
    fn entity(&self) -> &EntityContext;

    async fn transact<F, T, U>(&self, f: F) -> FieldResult<T>
    where
        F: Send,
        F: FnOnce(EntityContext) -> U,
        T: Send,
        U: Send,
        U: Future<Output = Result<T>>,
    {
        self.entity().transact(f).await.into_field_result()
    }
}

impl<'a> ContextExt for Context<'a> {
    fn entity(&self) -> &EntityContext {
        self.data_unchecked()
    }
}

pub trait ResultExt<T> {
    fn into_field_result(self) -> FieldResult<T>;
}

impl<T, E> ResultExt<T> for Result<T, E>
where
    Result<T, E>: AnyhowContext<T, E>,
    E: Display,
{
    fn into_field_result(self) -> FieldResult<T> {
        self.map_err(|error| FieldError::new(format!("{:#}", error)))
    }
}
