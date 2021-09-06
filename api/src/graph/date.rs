use super::prelude::*;

#[derive(Debug, Clone, From, Into, Deref)]
pub struct DateScalar(Date);

impl Serialize for DateScalar {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.deref().serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for DateScalar {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let date = Date::deserialize(deserializer)?;
        let date: DateScalar = date.into();
        Ok(date)
    }
}

scalar!(
    DateScalar,
    "Date",
    "ISO 8601 calendar date without time zone."
);

#[derive(Debug, Clone, From, Into, Deref)]
pub struct DateTimeScalar<Tz: TimeZone = Utc>(DateTime<Tz>);

impl<Tz: TimeZone> Serialize for DateTimeScalar<Tz> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.deref().serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for DateTimeScalar<Utc> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let date_time = DateTime::deserialize(deserializer)?;
        Ok(date_time.into())
    }
}

impl<'de> Deserialize<'de> for DateTimeScalar<FixedOffset> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let date_time = DateTime::deserialize(deserializer)?;
        Ok(date_time.into())
    }
}

scalar!(
    DateTimeScalar,
    "DateTime",
    "ISO 8601 combined date and time with time zone."
);
