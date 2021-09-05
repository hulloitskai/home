use super::prelude::*;

#[derive(Debug, Clone, From, Deref)]
pub struct HeartRateObject(HeartRate);

#[Object(name = "HeartRate")]
impl HeartRateObject {
    async fn id(&self) -> Id<HeartRateType> {
        self.key().into()
    }

    async fn created_at(&self) -> DateTimeScalar {
        let created_at = self.created_at.clone();
        created_at.into()
    }

    async fn updated_at(&self) -> DateTimeScalar {
        let updated_at = self.updated_at.clone();
        updated_at.into()
    }

    async fn measurement(&self) -> u16 {
        self.measurement
    }

    async fn timestamp(&self) -> DateTimeScalar {
        let timestamp = self.timestamp.clone();
        timestamp.into()
    }
}

#[derive(Debug, Clone, Copy)]
pub struct HeartRateQueries;

#[Object]
impl HeartRateQueries {
    async fn heart_rate(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<HeartRateObject>> {
        let rate = ctx
            .transact(|ctx| async move {
                let mut rates = HeartRate::find({
                    let one_day_ago = Utc::now() - Duration::days(1);
                    HeartRateConditions::builder()
                        .timestamp(Comparison::Gt(one_day_ago))
                        .build()
                })
                .sort(HeartRateSorting::Timestamp(SortingOrder::Desc))
                .load(&ctx)
                .await
                .context("failed to lookup heart rates")?;
                let rate = rates
                    .try_next()
                    .await
                    .context("failed to load heart rate")?;
                Ok(rate)
            })
            .await?;
        let rate = rate.map(HeartRateObject::from);
        Ok(rate)
    }
}
