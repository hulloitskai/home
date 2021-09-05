use super::prelude::*;

#[derive(Debug, Clone, Into, From, Deref)]
pub struct Id<T: ObjectType>(ObjectKey<T>);

impl<T: ObjectType> Id<T> {
    pub(super) fn new(key: ObjectKey<T>) -> Self {
        Id(key)
    }
}

#[Scalar(name = "ID")]
impl<T> ScalarType for Id<T>
where
    T: ObjectType,
    T: Send + Sync,
    T: Display,
    T: FromStr,
    <T as FromStr>::Err: StdError,
    <T as FromStr>::Err: Send + Sync + 'static,
{
    fn parse(value: Value) -> InputValueResult<Self> {
        let s = match value {
            Value::String(s) => s,
            _ => return Err(InputValueError::expected_type(value)),
        };
        let key: ObjectKey<T> = s
            .parse()
            .map_err(|error| InputValueError::custom(format!("{:#}", error)))?;
        let id = Self::new(key);
        Ok(id)
    }

    fn to_value(&self) -> Value {
        let opaque = self.deref().opaque();
        Value::String(opaque)
    }
}
