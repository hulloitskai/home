use std::io::ErrorKind as IoErrorKind;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use dotenv::dotenv;
use dotenv::Error as DotenvError;

pub use std::env::remove_var as remove_env;
pub use std::env::set_var as set_env;
pub use std::env::var as env;
pub use std::env::VarError as EnvVarError;

pub const PROJECT_NAME: &str = "home";
pub const PACKAGE_NAME: &str = env!("CARGO_PKG_NAME");

pub fn env_opt(key: &str) -> Result<Option<String>, EnvVarError> {
    match env(key) {
        Ok(value) => Ok(Some(value)),
        Err(EnvVarError::NotPresent) => Ok(None),
        Err(error) => Err(error),
    }
}

pub fn namespaced_env_opt(name: &str) -> Result<Option<String>, EnvVarError> {
    let value = {
        let namespace = PACKAGE_NAME.to_uppercase();
        let namespace = namespace.replace('-', "_");
        let key = format!("{}_{}", &namespace, name);
        env_opt(&key)?
    };
    let value = match value {
        Some(value) => Some(value),
        None => env_opt(name)?,
    };
    Ok(value)
}

pub fn namespaced_env(name: &str) -> Result<String> {
    let value = namespaced_env_opt(name).with_context(|| {
        format!("failed to read environment variable {}", name)
    })?;
    value.with_context(|| format!("missing environment variable {}", name))
}

pub fn load_env() -> Result<()> {
    if let Err(DotenvError::Io(error)) = dotenv() {
        if error.kind() != IoErrorKind::NotFound {
            return Err(error).context("failed to load .env");
        }
    }
    Ok(())
}
