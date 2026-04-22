//! Parse Ghostty's bundled theme files.
//!
//! Theme files live at `<Ghostty.app>/Contents/Resources/ghostty/themes/<Name>`
//! and use the normal Ghostty config grammar — a subset of it, really: just
//! `palette = N=#rrggbb`, `background = #…`, `foreground = #…`,
//! `cursor-color = #…`, `cursor-text = #…`,
//! `selection-background = #…`, `selection-foreground = #…`.

use std::fs;
use std::path::PathBuf;

use serde::Serialize;

use crate::commands::AppError;

#[derive(Debug, Clone, Serialize)]
pub struct ThemePreview {
    pub name: String,
    /// 16 palette slots (indexes 0..15). Missing entries are empty strings.
    pub palette: Vec<String>,
    pub background: Option<String>,
    pub foreground: Option<String>,
    pub cursor_color: Option<String>,
    pub selection_background: Option<String>,
    pub selection_foreground: Option<String>,
}

fn themes_dir_candidates() -> Vec<PathBuf> {
    vec![
        PathBuf::from("/Applications/Ghostty.app/Contents/Resources/ghostty/themes"),
        dirs::home_dir()
            .map(|h| h.join("Applications/Ghostty.app/Contents/Resources/ghostty/themes"))
            .unwrap_or_default(),
    ]
}

fn themes_dir() -> Result<PathBuf, AppError> {
    for p in themes_dir_candidates() {
        if p.is_dir() {
            return Ok(p);
        }
    }
    Err(AppError::GhosttyNotFound)
}

pub fn parse_theme_text(name: &str, text: &str) -> ThemePreview {
    let mut palette = vec![String::new(); 16];
    let mut background = None;
    let mut foreground = None;
    let mut cursor_color = None;
    let mut selection_background = None;
    let mut selection_foreground = None;

    for raw in text.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let Some(eq) = line.find('=') else { continue };
        let key = line[..eq].trim();
        let value = line[eq + 1..].trim();

        match key {
            "palette" => {
                if let Some(inner_eq) = value.find('=') {
                    let idx = value[..inner_eq].trim();
                    let color = value[inner_eq + 1..].trim().to_string();
                    if let Ok(i) = idx.parse::<usize>() {
                        if i < 16 {
                            palette[i] = color;
                        }
                    }
                }
            }
            "background" => background = Some(value.to_string()),
            "foreground" => foreground = Some(value.to_string()),
            "cursor-color" => cursor_color = Some(value.to_string()),
            "selection-background" => selection_background = Some(value.to_string()),
            "selection-foreground" => selection_foreground = Some(value.to_string()),
            _ => {}
        }
    }

    ThemePreview {
        name: name.to_string(),
        palette,
        background,
        foreground,
        cursor_color,
        selection_background,
        selection_foreground,
    }
}

pub fn load_all() -> Result<Vec<ThemePreview>, AppError> {
    let dir = themes_dir()?;
    let mut out = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| AppError::Io(e.to_string()))?.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let name = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n.to_string(),
            None => continue,
        };
        let Ok(text) = fs::read_to_string(&path) else { continue };
        out.push(parse_theme_text(&name, &text));
    }
    out.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_dracula_like() {
        let input = "\
palette = 0=#21222c
palette = 1=#ff5555
palette = 15=#ffffff
background = #282a36
foreground = #f8f8f2
cursor-color = #f8f8f2
";
        let t = parse_theme_text("Dracula", input);
        assert_eq!(t.name, "Dracula");
        assert_eq!(t.palette[0], "#21222c");
        assert_eq!(t.palette[1], "#ff5555");
        assert_eq!(t.palette[15], "#ffffff");
        assert_eq!(t.palette[5], ""); // not specified
        assert_eq!(t.background.as_deref(), Some("#282a36"));
        assert_eq!(t.foreground.as_deref(), Some("#f8f8f2"));
        assert_eq!(t.cursor_color.as_deref(), Some("#f8f8f2"));
    }
}
