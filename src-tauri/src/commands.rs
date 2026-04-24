//! #[tauri::command] handlers exposed to the JS/React frontend.
//!
//! Each command owns error conversion via `AppError`, which serializes
//! as a plain JSON object so `invoke()` rejects with a useful message.

use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;

use crate::config_io::{self, BackupInfo, ConfigPaths};
use crate::config_parser::{self, ConfigEntry};
use crate::ghostty_cli;
use crate::schema::{self, ConfigKey};
use crate::session::{self, SessionStatus};
use crate::themes::{self, ThemePreview};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Ghostty.app not found at /Applications/Ghostty.app — please install it from https://ghostty.org")]
    GhosttyNotFound,
    #[error("ghostty {args:?} failed: {stderr}")]
    GhosttyCli { args: Vec<String>, stderr: String },
    #[error("io: {0}")]
    Io(String),
}

impl Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

pub struct AppState {
    schema_cache: Mutex<Option<Vec<ConfigKey>>>,
    themes_cache: Mutex<Option<Vec<String>>>,
    fonts_cache: Mutex<Option<Vec<String>>>,
    actions_cache: Mutex<Option<Vec<String>>>,
    theme_previews_cache: Mutex<Option<Vec<ThemePreview>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            schema_cache: Mutex::new(None),
            themes_cache: Mutex::new(None),
            fonts_cache: Mutex::new(None),
            actions_cache: Mutex::new(None),
            theme_previews_cache: Mutex::new(None),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ValidationResult {
    pub ok: bool,
    pub message: String,
}

#[tauri::command]
pub fn get_schema(state: tauri::State<'_, AppState>) -> Result<Vec<ConfigKey>, AppError> {
    {
        let cache = state.schema_cache.lock().unwrap();
        if let Some(cached) = &*cache {
            return Ok(cached.clone());
        }
    }
    let output = ghostty_cli::run_capture(&["+show-config", "--default", "--docs"])?;
    let parsed = schema::parse(&output);
    *state.schema_cache.lock().unwrap() = Some(parsed.clone());
    Ok(parsed)
}

#[tauri::command]
pub fn get_config_path() -> Result<ConfigPaths, AppError> {
    config_io::resolved_paths()
}

#[tauri::command]
pub fn read_config() -> Result<Vec<ConfigEntry>, AppError> {
    let text = config_io::read_to_string()?;
    Ok(config_parser::parse(&text))
}

#[tauri::command]
pub fn write_config(entries: Vec<ConfigEntry>) -> Result<PathBuf, AppError> {
    let text = config_parser::serialize(&entries);
    config_io::write_with_backup(&text)
}

#[tauri::command]
pub fn validate_config(entries: Vec<ConfigEntry>) -> Result<ValidationResult, AppError> {
    let text = config_parser::serialize(&entries);
    let tmp = config_io::write_temp(&text)?;
    let tmp_str = tmp.to_string_lossy().to_string();
    let arg = format!("--config-file={tmp_str}");
    let (ok, message) = ghostty_cli::run_allow_failure(&["+validate-config", &arg])?;
    let _ = std::fs::remove_file(&tmp);
    Ok(ValidationResult { ok, message })
}

fn cached_list(
    slot: &Mutex<Option<Vec<String>>>,
    args: &[&str],
    post: impl Fn(String) -> Vec<String>,
) -> Result<Vec<String>, AppError> {
    {
        let cache = slot.lock().unwrap();
        if let Some(cached) = &*cache {
            return Ok(cached.clone());
        }
    }
    let output = ghostty_cli::run_capture(args)?;
    let list = post(output);
    *slot.lock().unwrap() = Some(list.clone());
    Ok(list)
}

fn lines_only(s: String) -> Vec<String> {
    s.lines()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty())
        .collect()
}

#[tauri::command]
pub fn list_themes(state: tauri::State<'_, AppState>) -> Result<Vec<String>, AppError> {
    cached_list(&state.themes_cache, &["+list-themes"], |s| {
        // Each line: "Theme Name (resources)" or similar — keep the name portion.
        s.lines()
            .map(|l| {
                let l = l.trim();
                if let Some(end) = l.rfind(" (") {
                    l[..end].to_string()
                } else {
                    l.to_string()
                }
            })
            .filter(|l| !l.is_empty())
            .collect()
    })
}

#[tauri::command]
pub fn list_fonts(state: tauri::State<'_, AppState>) -> Result<Vec<String>, AppError> {
    cached_list(&state.fonts_cache, &["+list-fonts"], lines_only)
}

#[tauri::command]
pub fn list_actions(state: tauri::State<'_, AppState>) -> Result<Vec<String>, AppError> {
    cached_list(&state.actions_cache, &["+list-actions"], lines_only)
}

#[tauri::command]
pub fn list_backups() -> Result<Vec<BackupInfo>, AppError> {
    config_io::list_backups()
}

/// Read an arbitrary file from disk and parse it as a Ghostty config.
/// Used by the Import feature after the user picks a file via the dialog.
#[tauri::command]
pub fn read_file_entries(path: PathBuf) -> Result<Vec<ConfigEntry>, AppError> {
    let text = std::fs::read_to_string(&path)
        .map_err(|e| AppError::Io(format!("read {}: {e}", path.display())))?;
    Ok(config_parser::parse(&text))
}

/// Serialize and write the given entries to an arbitrary path (no backup,
/// no validation — the user explicitly chose the destination). Used by Export.
#[tauri::command]
pub fn write_file_entries(path: PathBuf, entries: Vec<ConfigEntry>) -> Result<(), AppError> {
    let text = config_parser::serialize(&entries);
    std::fs::write(&path, text)
        .map_err(|e| AppError::Io(format!("write {}: {e}", path.display())))
}

#[tauri::command]
pub fn restore_backup(path: PathBuf) -> Result<(), AppError> {
    config_io::restore_backup(&path)
}

#[tauri::command]
pub fn list_theme_previews(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<ThemePreview>, AppError> {
    {
        let cache = state.theme_previews_cache.lock().unwrap();
        if let Some(cached) = &*cache {
            return Ok(cached.clone());
        }
    }
    let previews = themes::load_all()?;
    *state.theme_previews_cache.lock().unwrap() = Some(previews.clone());
    Ok(previews)
}

#[tauri::command]
pub fn session_status() -> Result<SessionStatus, AppError> {
    session::status()
}

#[tauri::command]
pub fn revert_session() -> Result<PathBuf, AppError> {
    session::revert()
}

#[tauri::command]
pub fn keep_session() -> Result<(), AppError> {
    session::keep()
}

#[derive(Debug, Serialize)]
pub struct SaveReloadResult {
    pub backup_path: PathBuf,
    pub reload_ok: bool,
    pub reload_error: Option<String>,
}

/// Validate → write config (with backup) → optionally reload Ghostty.
/// Reload failures are non-fatal — the save succeeded, we just report the
/// reload outcome so the UI can advise the user (e.g., grant Accessibility).
#[tauri::command]
pub fn save_and_reload(
    entries: Vec<ConfigEntry>,
    reload: bool,
) -> Result<SaveReloadResult, AppError> {
    let text = config_parser::serialize(&entries);

    // Validate first; bail early if invalid.
    let tmp = config_io::write_temp(&text)?;
    let tmp_str = tmp.to_string_lossy().to_string();
    let arg = format!("--config-file={tmp_str}");
    let (ok, message) = ghostty_cli::run_allow_failure(&["+validate-config", &arg])?;
    let _ = std::fs::remove_file(&tmp);
    if !ok {
        return Err(AppError::Io(format!("validation failed:\n{message}")));
    }

    let backup_path = config_io::write_with_backup(&text)?;

    let (reload_ok, reload_error) = if reload {
        match reload_ghostty_inner() {
            Ok(()) => (true, None),
            Err(e) => (false, Some(e.to_string())),
        }
    } else {
        (false, None)
    };

    Ok(SaveReloadResult {
        backup_path,
        reload_ok,
        reload_error,
    })
}

fn reload_ghostty_inner() -> Result<(), AppError> {
    let script = r#"
        tell application "Ghostty" to activate
        delay 0.15
        tell application "System Events"
            keystroke "," using {command down, shift down}
        end tell
    "#;
    let status = std::process::Command::new("osascript")
        .args(["-e", script])
        .status()
        .map_err(|e| AppError::Io(format!("osascript: {e}")))?;
    if !status.success() {
        return Err(AppError::Io(
            "osascript failed (grant Accessibility permission in System Settings)".into(),
        ));
    }
    Ok(())
}

/// Best-effort reload: focus Ghostty.app and send Cmd+Shift+, via AppleScript.
#[tauri::command]
pub fn reload_ghostty() -> Result<(), AppError> {
    reload_ghostty_inner()
}
