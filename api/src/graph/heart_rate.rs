use super::*;

#[derive(Debug, Clone, From)]
pub(super) struct HeartRateObject(HeartRate);

#[Object(name = "HeartRate")]
impl HeartRateObject {
    async fn id(&self) -> Id<HeartRate> {
        let HeartRateObject(rate) = self;
        rate.id.into()
    }

    async fn measured_at(&self) -> DateTimeScalar {
        let HeartRateObject(rate) = self;
        rate.measured_at.into()
    }

    async fn measurement(&self) -> u16 {
        let HeartRateObject(rate) = self;
        rate.measurement
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct HeartRateQuery;

#[Object]
impl HeartRateQuery {
    async fn heart_rate(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<HeartRateObject>> {
        self.resolve_heart_rate(ctx).await.map_err(format_error)
    }
}

impl HeartRateQuery {
    async fn resolve_heart_rate(
        &self,
        ctx: &Context<'_>,
    ) -> Result<Option<HeartRateObject>> {
        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());

        let mut rates = HeartRate::find({
            let one_day_ago = now() - Duration::days(1);
            HeartRateConditions::builder()
                .measured_at(Comparison::Gt(one_day_ago))
                .build()
        })
        .sort(HeartRateSorting::MeasuredAt(SortingDirection::Desc))
        .load(&ctx)
        .await
        .context("failed to find heart rates")?;
        let rate = rates
            .try_next()
            .await
            .context("failed to load heart rate")?;

        let rate = rate.map(HeartRateObject::from);
        Ok(rate)
    }
}
