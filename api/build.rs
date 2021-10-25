use anyhow::{Context, Result};
use chrono::Local;
use semver::Version;

use git::Repository;
use git::{DescribeFormatOptions, DescribeOptions};

use std::env::var as env_var;
use std::env::VarError as EnvVarError;

fn main() -> Result<()> {
    // Set build timestamp.
    set_build_env("BUILD_TIMESTAMP", &Local::now().to_rfc3339());

    // Set build version.
    let version = match env_var("BUILD_VERSION").ok() {
        Some(version) if !version.is_empty() => version,
        _ => {
            let version = git_version();
            match version {
                Ok(version) => version,
                Err(error) => {
                    eprintln!("failed to describe git version: {}", error);
                    String::new()
                }
            }
        }
    };
    let version = fmt_version(version);
    set_build_env("BUILD_VERSION", &version);

    Ok(())
}

fn git_version() -> Result<String> {
    let repo = Repository::discover(".").context("open repository")?;
    let desc = repo
        .describe(
            DescribeOptions::default()
                .describe_tags()
                .show_commit_oid_as_fallback(true),
        )
        .context("failed to describe HEAD")?;

    let suffix = env_var("BUILD_VERSION_DIRTY_SUFFIX");
    let suffix = match suffix {
        Ok(suffix) => suffix,
        Err(error) => match error {
            EnvVarError::NotPresent => String::new(),
            error => return Err(error).context("failed to get dirty suffix"),
        },
    };
    let suffix = match suffix.as_str() {
        "" => None,
        suffix => Some(format!("-{}", suffix)),
    };

    let mut opts = DescribeFormatOptions::default();
    if let Some(suffix) = &suffix {
        opts.dirty_suffix(suffix);
    };

    desc.format(Some(&opts))
        .context("failed to format describe result")
}

fn fmt_version(version: String) -> String {
    let trimmed = if let Some(version) = version.strip_prefix('v') {
        version
    } else {
        return version;
    };

    let version = if let Ok(version) = Version::parse(trimmed) {
        version
    } else {
        return trimmed.to_owned();
    };

    version.to_string()
}

fn set_build_env(key: &str, val: &str) {
    println!("cargo:rustc-env={}={}", key, val);
}
