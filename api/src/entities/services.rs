use super::prelude::*;

#[derive(Debug, Clone, Builder)]
pub struct Services {
    pub database: Database,
    pub database_client: DatabaseClient,
}
