use super::prelude::*;

use mailchecker::is_valid as is_valid_email;

// An `Email` is a structurally valid email address.
#[derive(Debug, Display, Clone, Hash, Into, Serialize, Deserialize, AsRef)]
pub struct Email(String);

impl Email {
    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub fn as_string(&self) -> &String {
        &self.0
    }
}

impl AsRef<str> for Email {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for Email {
    type Error = Error;

    fn try_from(s: String) -> Result<Self, Self::Error> {
        let lowered = s.to_lowercase();
        let trimmed = lowered.trim().to_owned();
        ensure!(is_valid_email(&trimmed), "bad format");
        let email = Self(trimmed);
        Ok(email)
    }
}

impl FromStr for Email {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::try_from(s.to_owned())
    }
}

impl From<Email> for Bson {
    fn from(email: Email) -> Self {
        let Email(s) = email;
        s.into()
    }
}
