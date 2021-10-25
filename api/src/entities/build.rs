use super::*;

use chrono::FixedOffset;

#[derive(Debug, Clone, Hash)]
pub struct BuildInfo {
    pub timestamp: DateTime<FixedOffset>,
    pub version: String,
}
