use super::prelude::*;

use graphql::ContainerType;

#[derive(Debug, Clone)]
pub struct Id<T: ContainerType> {
    inner: ObjectId,
    phantom: PhantomData<T>,
}

impl<T: ContainerType> Deref for Id<T> {
    type Target = ObjectId;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl<T: ContainerType> Id<T> {
    pub(super) fn new(id: ObjectId) -> Self {
        Self {
            inner: id,
            phantom: default(),
        }
    }
}

impl<T: ContainerType> From<ObjectId> for Id<T> {
    fn from(id: ObjectId) -> Self {
        Self::new(id)
    }
}

impl<T: ContainerType> From<Id<T>> for ObjectId {
    fn from(id: Id<T>) -> Self {
        id.inner
    }
}

#[Scalar(name = "ID")]
impl<T: ContainerType> ScalarType for Id<T> {
    fn parse(value: Value) -> InputValueResult<Self> {
        let opaque = match value {
            Value::String(s) => s,
            _ => return Err(InputValueError::expected_type(value)),
        };

        // Get compound value and split into segments.
        let compound = {
            let data = decode_base64(opaque)
                .context("failed to decode base64")
                .map_err(|error| {
                    InputValueError::custom(format!("{:?}", &error))
                })?;
            String::from_utf8_lossy(&data[..]).into_owned()
        };
        let segments = compound.split(':').collect::<Vec<_>>();

        // Verify type name.
        let expected_type_name = T::type_name();
        let (type_name, id) = match &segments[..] {
            &[type_name, id] => (type_name, id),
            _ => {
                let error = InputValueError::custom("bad format");
                return Err(error);
            }
        };
        if type_name != expected_type_name {
            let message = format!(
                "expected ID for {}, got ID for {}",
                &expected_type_name, type_name
            );
            let error = InputValueError::custom(message);
            return Err(error);
        }

        // Parse as ObjectId.
        let id: ObjectId =
            id.parse().context("failed to parse as ObjectId").map_err(
                |error| InputValueError::custom(format!("{:?}", &error)),
            )?;

        let id: Id<T> = id.into();
        Ok(id)
    }

    fn to_value(&self) -> Value {
        let id = self.deref().to_string();
        let type_name = T::type_name();
        let compound = format!("{}:{}", &type_name, &id);
        let opaque = encode_base64(&compound);
        Value::String(opaque)
    }
}
