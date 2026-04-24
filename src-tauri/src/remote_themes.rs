//! Fetch themes from the `mbadolato/iTerm2-Color-Schemes` repository's
//! `ghostty/` directory. Each file there is a valid ghostty config snippet
//! so we can reuse our local theme parser.
//!
//! We cache the parsed result to the OS cache dir so subsequent app starts
//! are fast and survive offline. TTL is 24h; on refresh failure we fall
//! back to whatever's on disk.

use std::path::PathBuf;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use futures::stream::{self, StreamExt};
use serde::{Deserialize, Serialize};

use crate::commands::AppError;
use crate::themes::{parse_theme_text, ThemePreview};

const REPO_OWNER: &str = "mbadolato";
const REPO_NAME: &str = "iTerm2-Color-Schemes";
const REPO_DIR: &str = "ghostty";
const USER_AGENT: &str = "ghostty-config-editor";
const TTL: Duration = Duration::from_secs(24 * 60 * 60);
const MAX_CONCURRENCY: usize = 12;

#[derive(Debug, Deserialize)]
struct ContentsEntry {
    name: String,
    #[serde(rename = "type")]
    kind: String,
    download_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CacheFile {
    fetched_at: u64,
    themes: Vec<ThemePreview>,
}

fn cache_path() -> Option<PathBuf> {
    dirs::cache_dir().map(|d| d.join("ghostty-config-editor/remote-themes.json"))
}

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn read_cache() -> Option<CacheFile> {
    let path = cache_path()?;
    let raw = std::fs::read_to_string(path).ok()?;
    serde_json::from_str(&raw).ok()
}

fn write_cache(file: &CacheFile) {
    let Some(path) = cache_path() else { return };
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Ok(raw) = serde_json::to_string(file) {
        let _ = std::fs::write(path, raw);
    }
}

async fn fetch_fresh() -> Result<Vec<ThemePreview>, AppError> {
    let client = reqwest::Client::builder()
        .user_agent(USER_AGENT)
        .build()
        .map_err(|e| AppError::Io(format!("http client: {e}")))?;

    let dir_url = format!(
        "https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{REPO_DIR}"
    );
    let entries: Vec<ContentsEntry> = client
        .get(&dir_url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .and_then(|r| r.error_for_status())
        .map_err(|e| AppError::Io(format!("github contents: {e}")))?
        .json()
        .await
        .map_err(|e| AppError::Io(format!("github contents json: {e}")))?;

    // Only files (skip subdirs) with a download_url.
    let files: Vec<(String, String)> = entries
        .into_iter()
        .filter_map(|e| {
            if e.kind == "file" {
                e.download_url.map(|u| (e.name, u))
            } else {
                None
            }
        })
        .collect();

    // Parallel fetch with bounded concurrency so we don't spam the raw CDN.
    let themes: Vec<ThemePreview> = stream::iter(files)
        .map(|(name, url)| {
            let c = client.clone();
            async move {
                let body = c
                    .get(&url)
                    .send()
                    .await
                    .and_then(|r| r.error_for_status())
                    .ok()?
                    .text()
                    .await
                    .ok()?;
                Some(parse_theme_text(&name, &body))
            }
        })
        .buffer_unordered(MAX_CONCURRENCY)
        .collect::<Vec<_>>()
        .await
        .into_iter()
        .flatten()
        .collect();

    let mut sorted = themes;
    sorted.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(sorted)
}

/// Cache-first fetch: returns fresh data if the on-disk copy is older than
/// the TTL (or missing); otherwise returns the cached copy. On network
/// failure, always falls back to cache so the UI keeps working offline.
pub async fn load() -> Result<Vec<ThemePreview>, AppError> {
    let cached = read_cache();
    if let Some(ref c) = cached {
        if now().saturating_sub(c.fetched_at) < TTL.as_secs() {
            return Ok(c.themes.clone());
        }
    }

    match fetch_fresh().await {
        Ok(fresh) => {
            write_cache(&CacheFile {
                fetched_at: now(),
                themes: fresh.clone(),
            });
            Ok(fresh)
        }
        Err(e) => {
            if let Some(c) = cached {
                Ok(c.themes)
            } else {
                Err(e)
            }
        }
    }
}
