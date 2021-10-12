use super::prelude::*;

pub use bson::oid::ObjectId;

#[derive(
    Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize,
)]
pub struct GlobalId {
    pub id: ObjectId,
    pub namespace: String,
}

impl Display for GlobalId {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        let raw = format!("{}:{}", &self.namespace, &self.id);
        let s = encode_base64(raw);
        Display::fmt(&s, f)
    }
}

impl FromStr for GlobalId {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let raw = {
            let data = decode_base64(s).context("failed to decode base64")?;
            String::from_utf8_lossy(&data[..]).into_owned()
        };
        let segments = raw.split(':').collect::<Vec<_>>();
        match &segments[..] {
            &[namespace, id] => {
                let id: ObjectId =
                    id.parse().context("failed to parse ObjectId")?;
                let id = GlobalId {
                    id,
                    namespace: namespace.to_owned(),
                };
                Ok(id)
            }
            _ => {
                bail!("bad format")
            }
        }
    }
}
