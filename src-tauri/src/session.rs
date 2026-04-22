//! Per-launch "session baseline" — a shadow copy of the user's config taken
//! when the app starts. Lets us offer a one-click "revert everything I did
//! this session" escape hatch on top of the longer-term `.bak-*` backups.
//!
//! Semantics:
//! * On every app launch, we (re)create the baseline from the current config.
//! * Writes during the session go straight to the real config file.
//! * The user can **Revert to session start** → baseline is copied back over
//!   the real config (plus a `.bak-*` made first so the revert is reversible).
//! * The user can **Keep session** → baseline is deleted and the current file
//!   becomes the new reference point (next write in the same session re-captures).
//!
//! The baseline path is `<config-dir>/.ghostty-editor-session-baseline`.

use std::fs;
use std::path::PathBuf;

use serde::Serialize;

use crate::commands::AppError;
use crate::config_io;

const BASELINE_NAME: &str = ".ghostty-editor-session-baseline";

pub fn baseline_path() -> Result<PathBuf, AppError> {
    let paths = config_io::resolved_paths()?;
    let parent = paths
        .real
        .parent()
        .ok_or_else(|| AppError::Io("config has no parent dir".into()))?;
    Ok(parent.join(BASELINE_NAME))
}

/// Capture (or re-capture) the baseline from the current config at app launch.
/// Silent no-op if the config file doesn't yet exist.
pub fn capture_at_launch() -> Result<(), AppError> {
    let paths = config_io::resolved_paths()?;
    if !paths.real.exists() {
        return Ok(());
    }
    let bp = baseline_path()?;
    fs::copy(&paths.real, &bp).map_err(|e| AppError::Io(e.to_string()))?;
    Ok(())
}

#[derive(Debug, Serialize)]
pub struct SessionStatus {
    pub baseline_exists: bool,
    /// Unix epoch seconds of the baseline file's mtime, if it exists.
    pub baseline_mtime: Option<u64>,
    /// True iff the current config differs from the baseline (byte-for-byte).
    pub is_modified: bool,
    pub baseline_path: PathBuf,
}

pub fn status() -> Result<SessionStatus, AppError> {
    let bp = baseline_path()?;
    let baseline_exists = bp.exists();
    let baseline_mtime = if baseline_exists {
        fs::metadata(&bp)
            .ok()
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
    } else {
        None
    };

    let is_modified = if baseline_exists {
        let paths = config_io::resolved_paths()?;
        let baseline = fs::read(&bp).unwrap_or_default();
        let current = if paths.real.exists() {
            fs::read(&paths.real).unwrap_or_default()
        } else {
            Vec::new()
        };
        baseline != current
    } else {
        false
    };

    Ok(SessionStatus {
        baseline_exists,
        baseline_mtime,
        is_modified,
        baseline_path: bp,
    })
}

/// Copy the baseline back over the current config. Also makes a regular
/// `.bak-*` of the *pre-revert* state so the revert itself is undoable.
pub fn revert() -> Result<PathBuf, AppError> {
    let bp = baseline_path()?;
    if !bp.exists() {
        return Err(AppError::Io("no session baseline to revert to".into()));
    }
    let baseline_text = fs::read_to_string(&bp).map_err(|e| AppError::Io(e.to_string()))?;
    config_io::write_with_backup(&baseline_text)
}

/// "Keep changes": delete the baseline so future writes capture a fresh one.
pub fn keep() -> Result<(), AppError> {
    let bp = baseline_path()?;
    if bp.exists() {
        fs::remove_file(&bp).map_err(|e| AppError::Io(e.to_string()))?;
    }
    Ok(())
}
