use std::env::remove_var as remove_env_var;
use std::env::set_var as set_env_var;
use std::env::VarError as EnvVarError;
use std::io::ErrorKind as IoErrorKind;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use dotenv::dotenv;
use dotenv::Error as DotenvError;

pub use std::env::var;

pub fn var_or(
    key: &str,
    default: impl Into<String>,
) -> Result<String, EnvVarError> {
    var(key).or_else(|error| match error {
        EnvVarError::NotPresent => Ok(default.into()),
        error => Err(error),
    })
}

pub fn load() -> Result<()> {
    if let Err(DotenvError::Io(error)) = dotenv() {
        if error.kind() != IoErrorKind::NotFound {
            return Err(error).context("failed to load .env");
        }
    }

    // Configure logging.
    let log = var_or("API_LOG", "info").unwrap();
    set_env_var("RUST_LOG", log);

    // Configure backtraces.
    remove_env_var("RUST_BACKTRACE");
    if None == var("API_BACKTRACE").ok() {
        set_env_var("RUST_BACKTRACE", "1")
    }
    Ok(())
}
