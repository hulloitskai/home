use super::*;

#[derive(Debug, Clone, Copy)]
pub(super) struct TestMutation;

#[Object]
impl TestMutation {
    async fn test_failure(&self) -> FieldResult<TestFailurePayload> {
        let error = FieldError::new("something went wrong");
        Err(error)
    }
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct TestFailurePayload {
    pub ok: bool,
}
