use super::*;

#[derive(Debug, Clone, From, Into, Deref)]
pub(super) struct DateScalar(Date);

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
