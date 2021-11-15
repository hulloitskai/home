use super::*;

#[derive(Debug, Clone, From)]
pub(super) struct HeartRateObject {
    pub record: Record<HeartRate>,
}

#[Object(name = "HeartRate")]
impl HeartRateObject {
    async fn id(&self) -> Id<HeartRate> {
        self.record.id().into()
    }

    async fn created_at(&self) -> DateTimeScalar {
        let created_at = self.record.created_at();
        created_at.into()
    }

    async fn updated_at(&self) -> DateTimeScalar {
        self.record.updated_at().into()
    }

    async fn measurement(&self) -> u16 {
        self.record.measurement
    }

    async fn timestamp(&self) -> DateTimeScalar {
        self.record.timestamp.into()
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct HeartRateQuery;

#[Object]
impl HeartRateQuery {
    async fn heart_rate(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<HeartRateObject>> {
        let services = ctx.services();
        let ctx = EntityContext::new(services.to_owned());

        let mut rates = HeartRate::find({
            let one_day_ago = now() - Duration::days(1);
            HeartRateConditions::builder()
                .timestamp(Comparison::Gt(one_day_ago))
                .build()
        })
        .sort(HeartRateSorting::Timestamp(SortingDirection::Desc))
        .load(&ctx)
        .await
        .context("failed to find heart rates")
        .into_field_result()?;
        let rate = rates
            .try_next()
            .await
            .context("failed to load heart rate")
            .into_field_result()?;

        let rate = rate.map(HeartRateObject::from);
        Ok(rate)
    }
}
