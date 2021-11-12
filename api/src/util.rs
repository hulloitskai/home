use super::*;

pub fn default<T: Default>() -> T {
    Default::default()
}

pub fn now() -> DateTime {
    Utc::now()
}
