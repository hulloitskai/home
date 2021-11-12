use super::*;

mod client;
mod reader;

use client::*;
use reader::*;

pub use client::{Service, ServiceConfig};

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct Note {
    pub id: String,
    pub names: Set<String>,

    #[builder(default)]
    pub links: Set<String>,

    #[builder(default)]
    pub tags: Set<String>,
}
