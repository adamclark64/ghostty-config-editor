//! Thin wrappers around the `ghostty` binary shipped inside Ghostty.app.
//!
//! On macOS the CLI lives at /Applications/Ghostty.app/Contents/MacOS/ghostty.
//! We intentionally avoid requiring `ghostty` to be on PATH.

use std::path::PathBuf;
use std::process::Command;

use crate::commands::AppError;

/// Candidate paths to the Ghostty CLI, in priority order.
fn ghostty_binary_candidates() -> Vec<PathBuf> {
    let mut out = vec![
        PathBuf::from("/Applications/Ghostty.app/Contents/MacOS/ghostty"),
    ];
    if let Some(home) = dirs::home_dir() {
        out.push(home.join("Applications/Ghostty.app/Contents/MacOS/ghostty"));
    }
    out
}

fn ghostty_binary() -> Result<PathBuf, AppError> {
    for p in ghostty_binary_candidates() {
        if p.exists() {
            return Ok(p);
        }
    }
    Err(AppError::GhosttyNotFound)
}

/// Run `ghostty <args...>` and capture stdout as a UTF-8 string.
/// Stderr is captured into the error if the process exits non-zero.
pub fn run_capture(args: &[&str]) -> Result<String, AppError> {
    let bin = ghostty_binary()?;
    let output = Command::new(&bin)
        .args(args)
        .output()
        .map_err(|e| AppError::Io(format!("spawning ghostty: {e}")))?;

    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    let stderr = String::from_utf8_lossy(&output.stderr).into_owned();

    if !output.status.success() {
        return Err(AppError::GhosttyCli {
            args: args.iter().map(|s| s.to_string()).collect(),
            stderr: if stderr.is_empty() { stdout.clone() } else { stderr },
        });
    }
    Ok(stdout)
}

/// Run a command and return (success, stderr-or-stdout) without treating
/// a non-zero exit as an error. Used by `validate-config` where non-zero
/// just means "config is invalid" and stderr holds the human-readable reason.
pub fn run_allow_failure(args: &[&str]) -> Result<(bool, String), AppError> {
    let bin = ghostty_binary()?;
    let output = Command::new(&bin)
        .args(args)
        .output()
        .map_err(|e| AppError::Io(format!("spawning ghostty: {e}")))?;

    let stderr = String::from_utf8_lossy(&output.stderr).into_owned();
    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    let message = if !stderr.is_empty() { stderr } else { stdout };
    Ok((output.status.success(), message))
}
