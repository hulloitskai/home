use super::utils::default;

use bson::Document;
use serde::{Deserialize, Serialize};

pub trait Conditions {
    fn into_document(self) -> Document;
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EmptyConditions;

impl Conditions for EmptyConditions {
    fn into_document(self) -> Document {
        default()
    }
}
