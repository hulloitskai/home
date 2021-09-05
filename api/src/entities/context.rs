use super::prelude::*;

#[derive(Debug, Clone)]
pub struct Context {
    services: Arc<Services>,
    settings: Arc<Settings>,
    current_transaction: Option<Arc<AsyncMutex<Transaction>>>,
}

impl Context {
    pub fn new(services: Services, settings: Settings) -> Self {
        Self {
            settings: settings.into(),
            services: services.into(),
            current_transaction: None,
        }
    }
}

impl Context {
    pub fn services(&self) -> &Services {
        &self.services
    }

    pub fn settings(&self) -> &Settings {
        &self.settings
    }
}

impl Context {
    pub(super) fn transaction(&self) -> Option<Arc<AsyncMutex<Transaction>>> {
        self.current_transaction.clone()
    }

    pub(super) async fn lock_transaction(
        &self,
    ) -> Option<AsyncMutexGuard<'_, Transaction>> {
        match &self.current_transaction {
            Some(transaction) => Some(transaction.lock().await),
            None => None,
        }
    }

    async fn with_transaction(
        &self,
    ) -> Result<Option<(Self, Arc<AsyncMutex<Transaction>>)>> {
        if self.current_transaction.is_some() {
            return Ok(None);
        }
        let Self {
            services, settings, ..
        } = self;
        let transaction = Transaction::new(services).await?;
        let transaction = Arc::new(AsyncMutex::new(transaction));
        let ctx = Self {
            services: services.clone(),
            settings: settings.clone(),
            current_transaction: transaction.clone().into(),
        };
        Ok(Some((ctx, transaction)))
    }

    pub async fn transact<F, T, U>(&self, f: F) -> Result<T>
    where
        F: FnOnce(Self) -> U,
        U: Future<Output = Result<T>>,
    {
        let transaction = self
            .with_transaction()
            .await
            .context("failed to begin transaction")?;
        if let Some((ctx, transaction)) = transaction {
            match f(ctx).await {
                Ok(value) => {
                    let mut transaction = transaction.lock().await;
                    transaction.commit().await?;
                    Ok(value)
                }
                Err(error) => {
                    let mut transaction = transaction.lock().await;
                    transaction.abort().await?;
                    Err(error)
                }
            }
        } else {
            let ctx = self.clone();
            f(ctx).await
        }
    }
}
