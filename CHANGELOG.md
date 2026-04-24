# ghostty-config-editor

## 0.5.0

### Minor Changes

- [#10](https://github.com/adamclark64/ghostty-config-editor/pull/10) [`da48f95`](https://github.com/adamclark64/ghostty-config-editor/commit/da48f95ef45d62a035d306a76debc96809375990) Thanks [@adamclark64](https://github.com/adamclark64)! - Make the preview pane's diff editable: edit the `+` value inline or click ↺ to revert that entry (per-slot for palette, per-chord for keybind).

- [#13](https://github.com/adamclark64/ghostty-config-editor/pull/13) [`0932a49`](https://github.com/adamclark64/ghostty-config-editor/commit/0932a49c1c70022a1f158fb6bce479b10109e056) Thanks [@adamclark64](https://github.com/adamclark64)! - Every schema key now has an editable UI. Each section gets a **More settings** catch-all at the bottom that renders the remaining keys routed to it (e.g. `macos-icon`, `macos-icon-frame`, and the 40+ other long-tail window keys) with generic widgets inferred from the key's type. Also: clear the sidebar search with the new **×** button or Esc.

- [#11](https://github.com/adamclark64/ghostty-config-editor/pull/11) [`8c1318a`](https://github.com/adamclark64/ghostty-config-editor/commit/8c1318a2f010e65c7f08848e4bb6767f7a180d7b) Thanks [@adamclark64](https://github.com/adamclark64)! - Bring back the randomize affordances: a **Randomize** button in the titlebar generates a fresh cohesive palette + background / foreground / cursor, and a **Random theme** button in the theme gallery picks one theme at random from the built-in and community pools.

## 0.4.0

### Minor Changes

- [#8](https://github.com/adamclark64/ghostty-config-editor/pull/8) [`faebb36`](https://github.com/adamclark64/ghostty-config-editor/commit/faebb36bcdbb891bbaf7dc0138d435a06bc31802) Thanks [@adamclark64](https://github.com/adamclark64)! - Rewrite the editor UI around a visual, section-based workflow.

  - Design-token system (CSS variables) with automatic dark/light tracking and a manual system/light/dark toggle in the titlebar.
  - Four-pane shell (titlebar, sidebar, section editor, preview) — all panes are resizable, sidebar and preview are collapsible, and the Live Preview card inside the preview pane is vertically resizable. Widths and heights persist across sessions.
  - Twelve section editors with section-specific visual affordances: theme card strip, sticky "Browse all →" button, full 256-color palette grid (standard / color cube / grayscale), font specimen cards, cursor style tiles, window padding/opacity visualization, keycap rows with a chord-capture modal, and more.
  - Inline color editing everywhere — `ColorSwatch` opens a portalled HSV picker (fixes a bug where the saturation-value plane was using HSL semantics and rendered the top-right corner as white).
  - Preview pane: live terminal mock, WCAG AA contrast readout, validation card, and per-key diff with per-slot rendering for `palette` and per-chord rendering for `keybind`.
  - Docs links on every field, sourced from the ghostty schema and shown via a hover popover.
  - `Backups` panel restored and restyled; titlebar wires Compare / Revert / Validate / Save & Reload to the existing Tauri commands.
  - Community themes: new Rust command `list_remote_themes` fetches and caches the `mbadolato/iTerm2-Color-Schemes` ghostty folder (24h TTL, offline fallback). The theme browser shows them as a distinct section with an "Apply as explicit palette" action.
  - Parser round-trip test locks the guarantee that unknown keys and repeated `palette` / `keybind` entries survive a parse → serialize cycle.

## 0.3.0

### Minor Changes

- [#4](https://github.com/adamclark64/ghostty-config-editor/pull/4) [`47451a9`](https://github.com/adamclark64/ghostty-config-editor/commit/47451a985995320635c2f15ddb75dbb09aef560c) Thanks [@adamclark64](https://github.com/adamclark64)! - Add Import and Export toolbar actions. Import replaces the current draft with a config file picked from disk (with a confirmation prompt if there are unsaved edits). Export writes the current draft to a user-chosen path with a timestamped default filename.

### Patch Changes

- [#3](https://github.com/adamclark64/ghostty-config-editor/pull/3) [`ed7d8c9`](https://github.com/adamclark64/ghostty-config-editor/commit/ed7d8c99def4c2263b702d5d68f9537f137c7b86) Thanks [@adamclark64](https://github.com/adamclark64)! - Replace the app icon with Ghostty's official blueprint logo. Adds `icons`, `icons:fetch`, and `icons:generate` npm scripts to keep the icon in sync with upstream.

## 0.2.0

### Minor Changes

- [#1](https://github.com/adamclark64/ghostty-config-editor/pull/1) [`d0234e4`](https://github.com/adamclark64/ghostty-config-editor/commit/d0234e4fd480969f6bad3b09ed6df01b51c72599) Thanks [@adamclark64](https://github.com/adamclark64)! - Set up automated release pipeline and fix theme-apply state sync.

  - Add Changesets + Conventional Commits enforcement (commitlint, husky, CI check).
  - Add `Release` workflow that opens/merges the "Version Packages" PR and tags versions on `main`.
  - Add `Publish DMG` workflow that builds signed (when secrets present) `.dmg` artifacts for Apple Silicon and Intel on each `v*` tag and uploads them to the GitHub Release.
  - Fix: picking a theme from the gallery now immediately reflects in the field editor and no longer re-enables `Save & Reload` with stale pre-theme values — so clicking `Keep` then saving keeps the theme instead of reverting to the session-start config.
