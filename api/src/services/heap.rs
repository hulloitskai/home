use super::*;

use serde_json::Map;

#[derive(Debug, Clone, Builder)]
pub struct ServiceConfig {
    pub app_id: String,
}

#[derive(Debug, Clone)]
pub struct Service(Arc<ServiceInner>);

impl Service {
    pub fn new(config: ServiceConfig) -> Self {
        let inner = ServiceInner::new(config);
        Service(Arc::new(inner))
    }

    pub fn track_concurrently(&self, identity: &str, event: impl Into<Event>) {
        let service = self.clone();
        let identity = identity.to_owned();
        let event: Event = event.into();
        spawn(async move {
            if let Err(error) = service.track(&identity, event.clone()).await {
                error!(
                    error = %format!("{:#}", &error),
                    event = %to_json_string(&event).unwrap(),
                    "failed to track event"
                )
            }
        });
    }

    delegate! {
        to self.0 {
            pub async fn track(&self, identity: &str, event: impl Into<Event>) -> Result<()>;
        }
    }
}

/// TODO: Use Batcher (with interval-stream flusher) to reduce round-trips to
/// Segment.
///
#[derive(Derivative, Clone)]
#[derivative(Debug)]
struct ServiceInner {
    #[derivative(Debug = "ignore")]
    client: HttpClient,
    app_id: String,
}

impl ServiceInner {
    pub fn new(config: ServiceConfig) -> Self {
        let ServiceConfig { app_id } = config;
        ServiceInner {
            client: default(),
            app_id,
        }
    }

    pub async fn track(
        &self,
        identity: &str,
        event: impl Into<Event>,
    ) -> Result<()> {
        let event: Event = event.into();
        let ServiceInner { client, app_id } = &self;
        let payload = json!({
            "app_id": app_id,
            "identity": identity,
            "event": event.name,
            "properties": event.properties,
        });
        client
            .post("https://heapanalytics.com/api/track")
            .json(&payload)
            .send()
            .await
            .context("request failed")?
            .error_for_status()
            .context("bad response")?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub name: String,
    pub properties: Map<String, Json>,
}

impl Event {
    pub fn new(name: &str, properties: Json) -> Self {
        let properties = match properties {
            Json::Object(properties) => properties,
            _ => panic!("properties must be an object"),
        };
        Event {
            name: name.to_owned(),
            properties,
        }
    }
}
