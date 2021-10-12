use super::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Cmp<T> {
    Eq(T),
    Gt(T),
    Gte(T),
    Lt(T),
    Lte(T),
}

impl<T> From<Cmp<T>> for Bson
where
    Bson: From<T>,
{
    fn from(comparison: Cmp<T>) -> Self {
        use Cmp::*;
        match comparison {
            Eq(value) => bson!({ "$eq": value }),
            Gt(value) => bson!({ "$gt": value }),
            Gte(value) => bson!({ "$gte": value }),
            Lt(value) => bson!({ "$lt": value }),
            Lte(value) => bson!({ "$lte": value }),
        }
    }
}

impl<T> From<T> for Cmp<T> {
    fn from(value: T) -> Self {
        Cmp::Eq(value)
    }
}
