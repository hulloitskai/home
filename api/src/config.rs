use std::io::ErrorKind as IoErrorKind;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use dotenv::from_filename as load_dotenv;
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

pub fn load_env() -> Result<()> {
    let filenames = [".env", ".env.local"];
    for filename in filenames {
        if let Err(DotenvError::Io(error)) = load_dotenv(filename) {
            if error.kind() != IoErrorKind::NotFound {
                return Err(error)
                    .with_context(|| format!("failed to load {}", filename));
            }
        }
    }
    Ok(())
}
