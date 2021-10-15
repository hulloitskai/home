use super::*;

use phones::country::CA;
use phones::parse as parse_phone;

/// A `Phone` is a structrually valid phone number.
#[derive(Debug, Display, Clone, Hash, Into, Serialize, Deserialize, AsRef)]
pub struct Phone(String);

impl Phone {
    delegate! {
        to self.0 {
            pub fn as_str(&self) -> &str;
        }
    }
}

impl AsRef<str> for Phone {
    delegate! {
        to self.0 {
            fn as_ref(&self) -> &str;
        }
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
        ensure!(phone.is_valid(), "invalid phone number");
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
