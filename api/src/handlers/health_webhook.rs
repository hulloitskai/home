use super::*;

#[derive(Clone, Builder)]
pub struct HealthWebhookExtension {
    services: Services,
}

pub async fn health_webhook_handler(
    Extension(extension): Extension<HealthWebhookExtension>,
    JsonExtractor(payload): JsonExtractor<HealthExportPayload>,
) -> HandlerResult<()> {
    let HealthWebhookExtension { services } = extension;
    receive(services, payload).await?;
    Ok(())
}

async fn receive(
    services: Services,
    payload: HealthExportPayload,
) -> Result<()> {
    let ctx = Context::new(services);
    for metric in payload.data.metrics {
        let HealthExportMetric::HeartRate(rate) = metric;
        for measurement in rate.data {
            let HealthExportHeartRateMeasurement {
                avg: measurement,
                date: measured_at,
            } = measurement;

            let measurement = measurement.round() as u16;
            let measured_at = {
                let measured_at =
                    DateTime::parse_from_str(&measured_at, "%F %T %z")
                        .context(
                            "failed to parse heart rate measurement date",
                        )?;
                DateTime::from(measured_at)
            };

            ctx.transact(|ctx| async move {
                let rate_exists = HeartRate::find_one({
                    HeartRateConditions::builder()
                        .measured_at(Comparison::Eq(measured_at))
                        .build()
                })
                .exists(&ctx)
                .await
                .context("failed to lookup conflicting heart rates")?;

                if !rate_exists {
                    let mut rate = HeartRate::builder()
                        .measurement(measurement)
                        .measured_at(measured_at)
                        .build();
                    rate.save(&ctx).await?;
                } else {
                    debug!(
                        %measured_at,
                        "existing heart rate for timestamp",
                    )
                }
                Ok(())
            })
            .await
            .context("failed to save heart rate")?;
        }
    }
    Ok(())
}

#[derive(Debug, Deserialize)]
pub struct HealthExportPayload {
    data: HealthExportData,
}

#[derive(Debug, Deserialize)]
struct HealthExportData {
    metrics: Vec<HealthExportMetric>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "name", rename_all = "snake_case")]
enum HealthExportMetric {
    HeartRate(HealthExportHeartRate),
}

#[derive(Debug, Deserialize)]
struct HealthExportHeartRate {
    data: Vec<HealthExportHeartRateMeasurement>,
}

#[derive(Debug, Deserialize)]
struct HealthExportHeartRateMeasurement {
    date: String,
    #[serde(rename = "Avg")]
    avg: f64,
}
