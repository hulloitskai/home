use super::*;

/// A `Handle` is a URL-safe identifier.
#[derive(
    Debug,
    Display,
    Clone,
    Hash,
    Into,
    PartialEq,
    Eq,
    Serialize,
    Deserialize,
    AsRef,
)]
pub struct Handle(String);

impl Handle {
    pub fn new(s: &str) -> Result<Self> {
        lazy_static! {
            static ref REGEX: Regex =
                Regex::new(r"^([a-z0-9]+-*)*[a-z0-9]$").unwrap();
        }
        ensure!(s.len() >= 2, "too short");
        ensure!(s.len() <= 32, "too long");
        ensure!(REGEX.is_match(s), "invalid characters");
        let handle = Self(s.to_owned());
        Ok(handle)
    }

    delegate! {
        to self.0 {
            pub fn as_str(&self) -> &str;
        }
    }
}

impl AsRef<str> for Handle {
    delegate! {
        to self.0 {
            fn as_ref(&self) -> &str;
        }
    }
}

impl FromStr for Handle {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::new(s)
    }
}

impl From<Handle> for Bson {
    fn from(handle: Handle) -> Self {
        let Handle(s) = handle;
        s.into()
    }
}
