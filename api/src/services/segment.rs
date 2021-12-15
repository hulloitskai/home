use super::*;

use ::segment::{Client, HttpClient};

pub use ::segment::Message;
pub use ::segment::{Error, Result};

pub use ::segment::message::Alias as AliasEvent;
pub use ::segment::message::Group as GroupEvent;
pub use ::segment::message::Identify as IdentifyEvent;
pub use ::segment::message::Page as PageEvent;
pub use ::segment::message::Screen as ScreenEvent;
pub use ::segment::message::Track as TrackEvent;
pub use ::segment::message::User as Identity;

#[derive(Debug, Clone, Builder)]
pub struct ServiceConfig {
    pub write_key: String,
}

#[derive(Debug, Clone)]
pub struct Service(Arc<ServiceInner>);

impl Service {
    pub fn new(config: ServiceConfig) -> Self {
        let inner = ServiceInner::new(config);
        Service(Arc::new(inner))
    }

    pub fn send_later(&self, event: impl Into<Event>) {
        let service = self.clone();
        let event: Event = event.into();
        spawn(async move {
            if let Err(error) = service.send(event).await {
                error!(
                    error = %format!("{:#}", &error),
                    "failed to send event"
                )
            }
        });
    }

    delegate! {
        to self.0 {
            pub async fn send(&self, event: impl Into<Event>) -> Result<()>;
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
    write_key: String,
}

/// An enum containing all values which may be sent to Segment's tracking API.
#[derive(Debug, Clone, From, TryInto, PartialEq, Serialize)]
#[serde(untagged)]
pub enum Event {
    Identify(IdentifyEvent),
    Track(TrackEvent),
    Page(PageEvent),
    Screen(ScreenEvent),
    Group(GroupEvent),
    Alias(AliasEvent),
}

impl From<Event> for Message {
    fn from(event: Event) -> Self {
        match event {
            Event::Identify(data) => Message::Identify(data),
            Event::Track(data) => Message::Track(data),
            Event::Page(data) => Message::Page(data),
            Event::Screen(data) => Message::Screen(data),
            Event::Group(data) => Message::Group(data),
            Event::Alias(data) => Message::Alias(data),
        }
    }
}

impl ServiceInner {
    pub fn new(config: ServiceConfig) -> Self {
        let ServiceConfig { write_key } = config;
        ServiceInner {
            client: default(),
            write_key,
        }
    }

    pub async fn send(&self, event: impl Into<Event>) -> Result<()> {
        let event: Event = event.into();
        let ServiceInner { client, write_key } = &self;
        debug!(event = %format_event(&event), "sending event");
        client.send(write_key.clone(), event.into()).await
    }
}

fn format_event(event: &Event) -> impl Display {
    to_json(event).unwrap()
}
