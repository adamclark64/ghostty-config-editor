//! Parse `ghostty +show-config --default --docs` into a typed schema and
//! heuristically infer a widget type for each of the ~580 config keys.
//!
//! The CLI output looks like:
//!
//!     # Doc paragraph line 1
//!     # Doc paragraph line 2
//!     # Available values are: `foo`, `bar`, `baz`.
//!     some-key = default-value
//!
//!     # next doc block...
//!     another-key = 42
//!
//! Some keys (`keybind`, `palette`, `font-family`, ...) appear multiple times
//! in the output — those are "repeatable". We preserve all defaults so the UI
//! can show them as list items.
//!
//! Type inference is a best-effort heuristic; unknown keys always fall back
//! to a free-form text input so every key remains editable.

use serde::Serialize;
use std::collections::HashMap;

/// Inferred widget type. The frontend dispatches to a widget based on this.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case", tag = "kind")]
pub enum WidgetType {
    Bool,
    Number,
    Color,
    Enum { values: Vec<String> },
    Theme,
    FontFamily,
    Keybind,
    /// Anything repeatable that isn't a keybind (palette, font-feature, ...).
    List,
    /// Free-form text fallback.
    Text,
}

#[derive(Debug, Clone, Serialize)]
pub struct ConfigKey {
    pub name: String,
    /// Concatenated doc paragraph from comment lines preceding the key.
    pub docs: String,
    /// All default values encountered for this key (usually 1; many for `palette`, `keybind`).
    pub defaults: Vec<String>,
    /// Prefix-based group for UI sidebar ("Font", "Window", "Advanced", ...).
    pub group: String,
    pub widget: WidgetType,
}

/// Parse the raw CLI output into a vector of ConfigKey.
pub fn parse(show_config_output: &str) -> Vec<ConfigKey> {
    let mut keys: Vec<String> = Vec::new(); // preserves discovery order
    let mut docs_by_key: HashMap<String, String> = HashMap::new();
    let mut defaults_by_key: HashMap<String, Vec<String>> = HashMap::new();

    let mut pending_docs: Vec<String> = Vec::new();

    for raw_line in show_config_output.lines() {
        let line = raw_line.trim_end();

        if line.is_empty() {
            // Blank line between blocks; keep accumulating (some blocks have
            // internal blank lines inside the comment paragraph).
            if !pending_docs.is_empty() {
                pending_docs.push(String::new());
            }
            continue;
        }

        if let Some(stripped) = line.strip_prefix('#') {
            // A comment line. Strip one leading space for readability.
            let doc = stripped.strip_prefix(' ').unwrap_or(stripped);
            pending_docs.push(doc.to_string());
            continue;
        }

        // Attempt to parse `key = value` (with arbitrary spacing around `=`).
        let Some(eq_idx) = line.find('=') else {
            pending_docs.clear();
            continue;
        };
        let key_part = line[..eq_idx].trim();
        let value_part = line[eq_idx + 1..].trim();

        if key_part.is_empty() {
            pending_docs.clear();
            continue;
        }

        let key = key_part.to_string();
        let is_first_occurrence = !docs_by_key.contains_key(&key);

        if is_first_occurrence {
            keys.push(key.clone());
            let docs_text = flatten_docs(&pending_docs);
            docs_by_key.insert(key.clone(), docs_text);
        }
        defaults_by_key
            .entry(key)
            .or_default()
            .push(value_part.to_string());

        pending_docs.clear();
    }

    keys.into_iter()
        .map(|name| {
            let docs = docs_by_key.remove(&name).unwrap_or_default();
            let defaults = defaults_by_key.remove(&name).unwrap_or_default();
            let widget = infer_widget(&name, &docs, &defaults);
            let group = group_for(&name);
            ConfigKey {
                name,
                docs,
                defaults,
                group,
                widget,
            }
        })
        .collect()
}

fn flatten_docs(lines: &[String]) -> String {
    // Collapse adjacent blank lines; trim trailing blanks.
    let mut out: Vec<String> = Vec::new();
    let mut last_blank = false;
    for line in lines {
        let blank = line.trim().is_empty();
        if blank {
            if last_blank {
                continue;
            }
            last_blank = true;
        } else {
            last_blank = false;
        }
        out.push(line.clone());
    }
    while out.last().map(|s| s.trim().is_empty()).unwrap_or(false) {
        out.pop();
    }
    out.join("\n")
}

fn is_hex_color(s: &str) -> bool {
    let t = s.trim();
    if !t.starts_with('#') {
        return false;
    }
    let hex = &t[1..];
    matches!(hex.len(), 3 | 4 | 6 | 8) && hex.chars().all(|c| c.is_ascii_hexdigit())
}

fn looks_numeric(s: &str) -> bool {
    let t = s.trim();
    if t.is_empty() {
        return false;
    }
    t.parse::<f64>().is_ok()
}

fn extract_enum_values(docs: &str) -> Option<Vec<String>> {
    // Look for a sentence introducing a list of backticked tokens.
    // Pattern: "<intro>: `a`, `b`, `c`."
    let intros = [
        "valid values",
        "available values",
        "available style keys are",
        "can be one of",
        "one of:",
        "one of the following",
        "must be one of",
        "supported values",
        "accepted values",
    ];

    let lower = docs.to_ascii_lowercase();
    let intro_pos = intros
        .iter()
        .filter_map(|needle| lower.find(needle).map(|pos| pos + needle.len()))
        .min()?;

    // Scan forward from the intro position for backticked tokens, stopping
    // when we hit two consecutive non-backtick paragraphs or the doc end.
    let tail = &docs[intro_pos..];

    // Collect all `...` tokens up to the next blank line.
    let stop_at = tail.find("\n\n").unwrap_or(tail.len());
    let window = &tail[..stop_at];

    let mut values: Vec<String> = Vec::new();
    let mut chars = window.char_indices().peekable();
    while let Some((i, c)) = chars.next() {
        if c == '`' {
            // find next backtick
            let rest = &window[i + 1..];
            if let Some(end) = rest.find('`') {
                let token = rest[..end].trim();
                // Accept enum-ish tokens only (no spaces, no `<foo>` placeholders).
                if !token.is_empty()
                    && !token.contains('<')
                    && !token.contains(' ')
                    && !token.contains('=')
                {
                    values.push(token.to_string());
                }
                // advance past the closing backtick
                for _ in 0..(end + 1) {
                    chars.next();
                }
            }
        }
    }

    // Dedupe while preserving order
    let mut seen = std::collections::HashSet::new();
    values.retain(|v| seen.insert(v.clone()));

    // Require at least 2 values; otherwise not an enum.
    if values.len() >= 2 {
        Some(values)
    } else {
        None
    }
}

fn docs_mention(docs: &str, needles: &[&str]) -> bool {
    let lower = docs.to_ascii_lowercase();
    needles.iter().any(|n| lower.contains(n))
}

fn infer_widget(name: &str, docs: &str, defaults: &[String]) -> WidgetType {
    // Curated overrides first.
    match name {
        "theme" => return WidgetType::Theme,
        "keybind" => return WidgetType::Keybind,
        _ => {}
    }

    if name.starts_with("font-family") {
        return WidgetType::FontFamily;
    }

    // Repeatable keys appear more than once in the default output.
    if defaults.len() > 1 {
        return WidgetType::List;
    }

    // Color-ish fields: key name hints OR default looks like a hex color.
    let color_hints = ["color", "background", "foreground"];
    let name_suggests_color = color_hints.iter().any(|h| {
        let idx = name.find(h);
        match idx {
            Some(i) => {
                // word boundary on both sides (start/end of string or non-alpha)
                let before_ok = i == 0 || !name.as_bytes()[i - 1].is_ascii_alphabetic();
                let after_byte = name.as_bytes().get(i + h.len()).copied();
                let after_ok = match after_byte {
                    None => true,
                    Some(b) => !(b.is_ascii_alphabetic()),
                };
                before_ok && after_ok
            }
            None => false,
        }
    });
    let default_is_color = defaults.first().map(|d| is_hex_color(d)).unwrap_or(false);
    if name_suggests_color || default_is_color {
        // Some "color"-named keys are actually enums ("none"/"auto") — if the
        // default isn't a hex value AND docs expose an enum, prefer enum.
        if !default_is_color {
            if let Some(values) = extract_enum_values(docs) {
                return WidgetType::Enum { values };
            }
        }
        return WidgetType::Color;
    }

    // Enum detection.
    if let Some(values) = extract_enum_values(docs) {
        return WidgetType::Enum { values };
    }

    // Booleans: default is literally true/false, or docs hint at boolean.
    let default_val = defaults.first().map(String::as_str).unwrap_or("");
    if matches!(default_val, "true" | "false") {
        return WidgetType::Bool;
    }
    if default_val.is_empty() && docs_mention(docs, &["set to `true`", "set to `false`"]) {
        return WidgetType::Bool;
    }

    // Numbers.
    if looks_numeric(default_val) {
        return WidgetType::Number;
    }

    WidgetType::Text
}

fn group_for(name: &str) -> String {
    // Map key prefixes to human-readable section names.
    let prefix = name.split('-').next().unwrap_or(name);
    let group = match prefix {
        "font" => "Font",
        "adjust" => "Font",
        "freetype" => "Font",
        "theme" | "background" | "foreground" | "selection" | "minimum" | "palette"
        | "bold" | "alpha" => "Colors & Theme",
        "cursor" => "Cursor",
        "window" | "title" | "maximize" | "fullscreen" | "macos" | "linux" | "gtk" => "Window",
        "keybind" => "Keybinds",
        "mouse" => "Mouse",
        "scrollback" | "scroll" => "Scrollback",
        "clipboard" | "copy" | "paste" => "Clipboard",
        "shell" | "command" | "term" | "working" | "env" | "initial" | "abnormal" | "wait"
        | "quit" | "confirm" | "auto" | "shutdown" => "Shell & Session",
        "resize" | "grapheme" | "unicode" | "ime" => "Rendering",
        "config" | "app" | "custom" | "image" | "quick" | "focus" | "class" => "App",
        _ => "Advanced",
    };
    group.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_basic_block() {
        let input = "\
# Font size in points.
font-size = 13

# Cursor style.
# Valid values are: `block`, `bar`, `underline`.
cursor-style = block

# A boolean toggle.
mouse-hide-while-typing = false

# Background color of the terminal.
background = #282c34

# Keybind (repeatable).
keybind = ctrl+c=copy_to_clipboard
keybind = ctrl+v=paste_from_clipboard
";
        let keys = parse(input);
        assert_eq!(keys.len(), 5);

        let by_name: HashMap<_, _> = keys.iter().map(|k| (k.name.as_str(), k)).collect();

        assert!(matches!(by_name["font-size"].widget, WidgetType::Number));
        assert!(matches!(
            by_name["cursor-style"].widget,
            WidgetType::Enum { .. }
        ));
        assert!(matches!(by_name["mouse-hide-while-typing"].widget, WidgetType::Bool));
        assert!(matches!(by_name["background"].widget, WidgetType::Color));
        assert!(matches!(by_name["keybind"].widget, WidgetType::Keybind));
        assert_eq!(by_name["keybind"].defaults.len(), 2);

        if let WidgetType::Enum { values } = &by_name["cursor-style"].widget {
            assert_eq!(values, &vec!["block".to_string(), "bar".to_string(), "underline".to_string()]);
        } else {
            panic!("expected enum");
        }
    }

    #[test]
    fn color_hex_detection() {
        assert!(is_hex_color("#abcdef"));
        assert!(is_hex_color("#ABC"));
        assert!(is_hex_color("#ffffffff"));
        assert!(!is_hex_color("block"));
        assert!(!is_hex_color("#xyz"));
    }
}
