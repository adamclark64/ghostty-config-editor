# ghostty-config-editor

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
