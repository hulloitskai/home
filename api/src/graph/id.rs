use super::*;

#[derive(Debug, Clone, From, Into, Deref)]
pub(super) struct Id(GlobalId);

impl Id {
    pub fn new<T: Entity>(record: &Record<T>) -> Self {
        let id = GlobalId::from(record.id().to_owned());
        Self(id)
    }
}

#[Scalar(name = "ID")]
impl ScalarType for Id {
    fn parse(value: Value) -> InputValueResult<Self> {
        let id = match value {
            Value::String(s) => s,
            _ => return Err(InputValueError::expected_type(value)),
        };
        let id: GlobalId = id.parse().map_err(|error| {
            InputValueError::custom(format!("{:?}", &error))
        })?;
        Ok(Id(id))
    }

    fn to_value(&self) -> Value {
        let Id(id) = self;
        Value::String(id.to_string())
    }
}
