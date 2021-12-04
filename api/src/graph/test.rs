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
    async fn test(
        &self,
        ctx: &Context<'_>,
        input: TestInput,
    ) -> FieldResult<TestPayload> {
        self.resolve_test(ctx, input).await.map_err(format_error)
    }

    async fn test_failure(
        &self,
        #[graphql(name = "input")] _input: TestInput,
    ) -> FieldResult<TestPayload> {
        let error = FieldError::new("something went wrong");
        Err(error)
    }
}

impl TestMutation {
    async fn resolve_test(
        &self,
        ctx: &Context<'_>,
        input: TestInput,
    ) -> Result<TestPayload> {
        let properties = json!({ "input": &input });
        let TestInput { value } = input;

        let identity = ctx.identity();
        let services = ctx.services();
        let segment = services.segment();

        // Track mutation
        if let Some(user) = identity {
            segment.send_later(SegmentTrackEvent {
                user: user.to_owned(),
                event: "Test".to_owned(),
                properties,
                ..default()
            });
        }

        let payload = TestPayload { ok: true, value };
        Ok(payload)
    }
}

#[derive(Debug, Clone, Serialize, InputObject)]
pub(super) struct TestInput {
    pub value: String,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct TestPayload {
    pub value: String,
    pub ok: bool,
}
