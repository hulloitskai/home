use chrono::Utc;

pub type DateTime = chrono::DateTime<Utc>;

pub fn default<T: Default>() -> T {
    T::default()
}

pub fn now() -> DateTime {
    Utc::now()
}
