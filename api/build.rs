use anyhow::Result;
use chrono::Local;

fn main() -> Result<()> {
    // Set build timestamp.
    set_build_env("BUILD_TIMESTAMP", &Local::now().to_rfc3339());
    Ok(())
}

fn set_build_env(key: &str, val: &str) {
    println!("cargo:rustc-env={}={}", key, val);
}
