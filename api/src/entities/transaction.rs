use super::prelude::*;

use mongodb::ClientSession as DatabaseSession;

#[derive(Debug, Clone)]
pub struct Transaction {
    session: DatabaseSession,
}

impl Transaction {
    pub(super) async fn new(backend: &Services) -> Result<Self> {
        let mut database = backend
            .database_client
            .start_session(None)
            .await
            .context("failed to start database session")?;
        database.start_transaction(None).await?;
        let transaction = Self { session: database };
        Ok(transaction)
    }

    pub(super) async fn commit(&mut self) -> Result<()> {
        self.session.commit_transaction().await?;
        Ok(())
    }

    pub(super) async fn abort(&mut self) -> Result<()> {
        self.session.abort_transaction().await?;
        Ok(())
    }

    pub(super) fn session(&mut self) -> &mut DatabaseSession {
        &mut self.session
    }
}
