use super::*;

use tokio::time::interval;
use tokio_stream::wrappers::IntervalStream;

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct TestQuery;

#[Object]
impl TestQuery {
    async fn test(&self) -> bool {
        true
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct TestSubscription;

#[Subscription]
impl TestSubscription {
    async fn test(&self) -> impl Stream<Item = i32> {
        let mut value = 0;
        let period = StdDuration::from_secs(1);
        IntervalStream::new(interval(period)).map(move |_| {
            value += 1;
            value
        })
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct TestMutation;

#[Object]
impl TestMutation {
    async fn test(&self, input: TestInput) -> TestPayload {
        let TestInput { value } = input;
        TestPayload { ok: true, value }
    }

    async fn test_failure(
        &self,
        #[graphql(name = "input")] _input: TestInput,
    ) -> FieldResult<TestPayload> {
        let error = FieldError::new("something went wrong");
        Err(error)
    }
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct TestInput {
    pub value: String,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct TestPayload {
    pub ok: bool,
    pub value: String,
}
