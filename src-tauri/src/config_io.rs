//! Locate, read, back up, and atomically write the Ghostty config file.
//!
//! The default macOS config path is
//! `~/Library/Application Support/com.mitchellh.ghostty/config`.
//! That file is frequently a symlink into a dotfiles repo — we follow the
//! symlink when resolving and write to the real target.

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use chrono::Local;
use serde::Serialize;

use crate::commands::AppError;

#[derive(Debug, Serialize)]
pub struct ConfigPaths {
    /// The path we advertise (may be a symlink).
    pub logical: PathBuf,
    /// The final on-disk file, symlinks resolved. Same as logical if not a symlink.
    pub real: PathBuf,
}

pub fn default_config_path() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or_else(|| AppError::Io("no HOME dir".into()))?;
    Ok(home
        .join("Library")
        .join("Application Support")
        .join("com.mitchellh.ghostty")
        .join("config"))
}

pub fn resolved_paths() -> Result<ConfigPaths, AppError> {
    let logical = default_config_path()?;
    let real = if logical.exists() {
        fs::canonicalize(&logical).map_err(|e| AppError::Io(e.to_string()))?
    } else {
        logical.clone()
    };
    Ok(ConfigPaths { logical, real })
}

pub fn read_to_string() -> Result<String, AppError> {
    let paths = resolved_paths()?;
    if !paths.real.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(&paths.real).map_err(|e| AppError::Io(e.to_string()))
}

fn backup_filename(real: &Path) -> PathBuf {
    let stamp = Local::now().format("%Y%m%d-%H%M%S");
    let fname = real
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "config".into());
    real.with_file_name(format!("{fname}.bak-{stamp}"))
}

/// Write `contents` to the resolved real path, atomically.
/// Before overwriting, copy the current file to a timestamped `.bak-*` sibling.
pub fn write_with_backup(contents: &str) -> Result<PathBuf, AppError> {
    let paths = resolved_paths()?;

    // Ensure parent dir exists.
    if let Some(parent) = paths.real.parent() {
        fs::create_dir_all(parent).map_err(|e| AppError::Io(e.to_string()))?;
    }

    let backup_path = if paths.real.exists() {
        let bp = backup_filename(&paths.real);
        fs::copy(&paths.real, &bp).map_err(|e| AppError::Io(e.to_string()))?;
        Some(bp)
    } else {
        None
    };

    // Write to a temp file in the same dir for an atomic rename.
    let tmp_path = paths.real.with_extension("tmp-new");
    {
        let mut f = fs::File::create(&tmp_path).map_err(|e| AppError::Io(e.to_string()))?;
        f.write_all(contents.as_bytes())
            .map_err(|e| AppError::Io(e.to_string()))?;
        f.sync_all().map_err(|e| AppError::Io(e.to_string()))?;
    }
    fs::rename(&tmp_path, &paths.real).map_err(|e| AppError::Io(e.to_string()))?;

    Ok(backup_path.unwrap_or(paths.real))
}

#[derive(Debug, Serialize)]
pub struct BackupInfo {
    pub path: PathBuf,
    /// "20260422-143015"
    pub stamp: String,
    pub size: u64,
}

pub fn list_backups() -> Result<Vec<BackupInfo>, AppError> {
    let paths = resolved_paths()?;
    let Some(dir) = paths.real.parent() else {
        return Ok(vec![]);
    };
    let fname = paths
        .real
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();
    let prefix = format!("{fname}.bak-");

    let mut out = Vec::new();
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return Ok(vec![]),
    };
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if let Some(stamp) = name.strip_prefix(&prefix) {
            let meta = entry.metadata().ok();
            out.push(BackupInfo {
                path: entry.path(),
                stamp: stamp.to_string(),
                size: meta.as_ref().map(|m| m.len()).unwrap_or(0),
            });
        }
    }
    out.sort_by(|a, b| b.stamp.cmp(&a.stamp)); // newest first
    Ok(out)
}

pub fn restore_backup(src: &Path) -> Result<(), AppError> {
    // Make a fresh pre-restore backup, then copy src over the real config.
    let paths = resolved_paths()?;
    if paths.real.exists() {
        let pre = backup_filename(&paths.real);
        fs::copy(&paths.real, &pre).map_err(|e| AppError::Io(e.to_string()))?;
    }
    fs::copy(src, &paths.real).map_err(|e| AppError::Io(e.to_string()))?;
    Ok(())
}

/// Write `contents` to a fresh temp file and return its path. Used for
/// `ghostty +validate-config --config-file=TMP` dry runs.
pub fn write_temp(contents: &str) -> Result<PathBuf, AppError> {
    let dir = std::env::temp_dir();
    let stamp = Local::now().format("%Y%m%d-%H%M%S-%f");
    let path = dir.join(format!("ghostty-editor-{stamp}.config"));
    let mut f = fs::File::create(&path).map_err(|e| AppError::Io(e.to_string()))?;
    f.write_all(contents.as_bytes())
        .map_err(|e| AppError::Io(e.to_string()))?;
    Ok(path)
}
