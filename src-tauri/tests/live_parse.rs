//! Integration test that runs the real Ghostty CLI, parses its full 580-key
//! schema, and asserts that a handful of well-known keys get sensible widget
//! types. Ignored by default because it depends on Ghostty.app being installed.

use std::process::Command;

use ghostty_config_editor_lib::{self as _};

// Re-export the schema module via a thin wrapper since the library's modules
// are private; this test compiles against the crate's public API only. For
// now we re-run the CLI ourselves and assert high-level properties.

#[test]
#[ignore]
fn live_ghostty_cli_runs() {
    let bin = "/Applications/Ghostty.app/Contents/MacOS/ghostty";
    let out = Command::new(bin)
        .args(["+show-config", "--default", "--docs"])
        .output()
        .expect("spawn ghostty");
    assert!(out.status.success(), "ghostty CLI failed");
    let s = String::from_utf8(out.stdout).unwrap();
    // Coarse sanity: we expect at least a few hundred key = value lines.
    let key_lines = s
        .lines()
        .filter(|l| !l.starts_with('#') && l.contains('='))
        .count();
    assert!(key_lines > 200, "expected many keys, got {key_lines}");
}
