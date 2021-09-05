use super::prelude::*;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortingOrder {
    Asc,
    Desc,
}

impl Default for SortingOrder {
    fn default() -> Self {
        Self::Asc
    }
}

impl From<SortingOrder> for Bson {
    fn from(order: SortingOrder) -> Self {
        use SortingOrder::*;
        match order {
            Asc => Bson::Int32(1),
            Desc => Bson::Int32(-1),
        }
    }
}

impl From<Bson> for SortingOrder {
    fn from(bson: Bson) -> Self {
        use SortingOrder::*;
        match bson {
            Bson::Int32(1) => Asc,
            Bson::Int32(-1) => Desc,
            other => panic!("invalid sorting order: {}", other),
        }
    }
}
