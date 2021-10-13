use anyhow::Result;
use bson::Document;

pub trait Object: Sized {
    fn to_document(&self) -> Result<Document>;

    fn from_document(doc: Document) -> Result<Self>;
}
