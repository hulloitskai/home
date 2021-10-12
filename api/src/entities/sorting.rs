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
        let order = match order {
            Asc => 1,
            Desc => -1,
        };
        order.into()
    }
}

impl From<Bson> for SortingOrder {
    fn from(bson: Bson) -> Self {
        use Bson::*;
        use SortingOrder::*;
        match bson {
            Int32(1) => Asc,
            Int32(-1) => Desc,
            other => panic!("invalid sorting order: {}", other),
        }
    }
}
