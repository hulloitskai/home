use super::*;

#[derive(Debug, Clone, From)]
pub(super) struct HeartRateObject {
    pub record: Record<HeartRate>,
}


#[Object(name = "HeartRate")]
impl HeartRateObject {
    async fn id(&self) -> Id {
        Id::new(&self.record)
    }

    async fn created_at(&self) -> DateTimeScalar {
        let created_at = self.record.created_at().to_owned();
        created_at.into()
    }

    async fn updated_at(&self) -> DateTimeScalar {
        let updated_at = self.record.updated_at().to_owned();
        updated_at.into()
    }

    async fn measurement(&self) -> u16 {
        self.record.measurement
    }

    async fn timestamp(&self) -> DateTimeScalar {
        let timestamp = self.record.timestamp.clone();
        timestamp.into()
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct HeartRateQueries;

#[Object]
impl HeartRateQueries {
    async fn heart_rate(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<Option<HeartRateObject>> {
        let rate = ctx
            .transact(|ctx| async move {
                let mut rates = HeartRate::find({
                    let one_day_ago = now() - Duration::days(1);
                    HeartRateConditions::builder()
                        .timestamp(Comparison::Gt(one_day_ago))
                        .build()
                })
                .sort(HeartRateSorting::Timestamp(SortingDirection::Desc))
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
