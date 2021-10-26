use super::*;

#[derive(Debug, Clone, From, Into, Deref)]
pub(super) struct Id<T: Entity>(EntityId<T>);

#[Scalar(name = "ID")]
impl<T: Entity> ScalarType for Id<T> {
    fn parse(value: Value) -> InputValueResult<Self> {
        let id = match value {
            Value::String(s) => s,
            _ => return Err(InputValueError::expected_type(value)),
        };
        let id: EntityId<T> = id.parse().map_err(|error| {
            let message = format!("{:?}", &error);
            InputValueError::custom(message)
        })?;
        Ok(Id(id))
    }

    fn to_value(&self) -> Value {
        let Id(id) = self;
        Value::String(id.to_string())
    }
}
