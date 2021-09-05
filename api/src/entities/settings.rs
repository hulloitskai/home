use super::prelude::*;

#[derive(Debug, Clone, Builder)]
pub struct Settings {
    pub web_public_url: Url,
}
