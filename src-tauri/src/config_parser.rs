//! Parse a user's existing Ghostty config file into an ordered list of
//! entries while preserving blank lines, comments, and the original order.
//! This lets us re-serialize without destroying user-authored structure.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum ConfigEntry {
    /// A `key = value` pair.
    Entry { key: String, value: String },
    /// A comment line starting with `#`. Stored without the leading `#`.
    Comment { text: String },
    /// A blank line.
    Blank,
}

pub fn parse(text: &str) -> Vec<ConfigEntry> {
    let mut out = Vec::new();
    for raw in text.lines() {
        let line = raw.trim_end_matches('\r');
        let trimmed = line.trim_start();
        if trimmed.is_empty() {
            out.push(ConfigEntry::Blank);
            continue;
        }
        if let Some(rest) = trimmed.strip_prefix('#') {
            let text = rest.strip_prefix(' ').unwrap_or(rest).to_string();
            out.push(ConfigEntry::Comment { text });
            continue;
        }
        if let Some(eq) = line.find('=') {
            let key = line[..eq].trim().to_string();
            let value = line[eq + 1..].trim().to_string();
            if !key.is_empty() {
                out.push(ConfigEntry::Entry { key, value });
                continue;
            }
        }
        // Unrecognized line — preserve as a comment for safety rather than losing it.
        out.push(ConfigEntry::Comment {
            text: format!(" (unrecognized) {}", line),
        });
    }
    out
}

pub fn serialize(entries: &[ConfigEntry]) -> String {
    let mut out = String::new();
    for e in entries {
        match e {
            ConfigEntry::Entry { key, value } => {
                out.push_str(key);
                out.push_str(" = ");
                out.push_str(value);
                out.push('\n');
            }
            ConfigEntry::Comment { text } => {
                out.push('#');
                if !text.starts_with(' ') && !text.is_empty() {
                    out.push(' ');
                }
                out.push_str(text);
                out.push('\n');
            }
            ConfigEntry::Blank => out.push('\n'),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_preserve_structure() {
        let input = "# hello\n\nfont-size = 14\ntheme = Catppuccin Mocha\n\n# trailing\n";
        let parsed = parse(input);
        let out = serialize(&parsed);
        assert_eq!(out, input);
    }

    /// Unknown keys (not in the editor's schema) and repeatable keys with
    /// multiple occurrences must round-trip without loss, preserving their
    /// original order relative to surrounding comments. The UI relies on
    /// this so it can surface "Unknown keys" without touching the on-disk
    /// entries that live under them.
    #[test]
    fn round_trips_unknown_and_repeatable_keys() {
        let input = "\
# palette
palette = 0=#000000
palette = 1=#ff0000
palette = 2=#00ff00

# experimental knobs not surfaced in the UI
unknown-future-key = 42
another-unknown = hello world

keybind = super+t=new_tab
keybind = super+w=close_surface
";
        let parsed = parse(input);
        let out = serialize(&parsed);
        assert_eq!(out, input);
    }

}
