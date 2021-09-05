use super::prelude::*;

use phonenumber::parse as parse_phone;
use phonenumber::country::CA;

/// A `Phone` is a structrually valid phone number.
#[derive(Debug, Display, Clone, Hash, Into, Serialize, Deserialize, AsRef)]
pub struct Phone(String);

impl Phone {
    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub fn as_string(&self) -> &String {
        &self.0
    }
}

impl AsRef<str> for Phone {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl TryFrom<String> for Phone {
    type Error = Error;

    fn try_from(s: String) -> Result<Self, Self::Error> {
        s.parse()
    }
}

impl FromStr for Phone {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let phone = parse_phone(CA.into(), s)?;
        let phone = phone.format();
        let phone = Self(phone.to_string());
        Ok(phone)
    }
}

impl From<Phone> for Bson {
    fn from(phone: Phone) -> Self {
        let Phone(s) = phone;
        s.into()
    }
}
