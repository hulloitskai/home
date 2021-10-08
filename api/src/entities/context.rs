use super::prelude::*;

#[derive(Debug, Clone)]
pub struct Context {
    services: Arc<Services>,
    settings: Arc<Settings>,
    transaction: Option<Arc<AsyncMutex<Transaction>>>,
}

impl Context {
    pub fn new(services: Services, settings: Settings) -> Self {
        Self {
            settings: settings.into(),
            services: services.into(),
            transaction: None,
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
        self.transaction.clone()
    }

    async fn init_transaction(&self) -> Result<TransactionState> {
        let state = match self.transaction() {
            Some(transaction) => TransactionState {
                ctx: self.to_owned(),
                transaction: transaction.to_owned(),
                is_root: false,
            },
            None => {
                let Self {
                    services, settings, ..
                } = self;
                let transaction = {
                    let transaction =
                        Transaction::new(&services.database_client).await?;
                    Arc::new(AsyncMutex::new(transaction))
                };
                let ctx = Self {
                    services: services.clone(),
                    settings: settings.clone(),
                    transaction: Some(transaction.clone()),
                };
                TransactionState {
                    ctx,
                    transaction,
                    is_root: true,
                }
            }
        };
        Ok(state)
    }

    pub(super) async fn with_transaction<F, T, U>(&self, f: F) -> Result<T>
    where
        F: FnOnce(Self, Arc<AsyncMutex<Transaction>>) -> U,
        U: Future<Output = Result<T>>,
    {
        let TransactionState {
            ctx,
            transaction,
            is_root,
        } = self
            .init_transaction()
            .await
            .context("failed to begin transaction")?;

        if is_root {
            match f(ctx, transaction.clone()).await {
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
            f(ctx, transaction).await
        }
    }
}

impl Context {
    pub async fn transact<F, T, U>(&self, f: F) -> Result<T>
    where
        F: FnOnce(Self) -> U,
        U: Future<Output = Result<T>>,
    {
        self.with_transaction(|ctx, _| f(ctx)).await
    }
}

#[derive(Debug)]
struct TransactionState {
    ctx: Context,
    transaction: Arc<AsyncMutex<Transaction>>,
    is_root: bool,
}
