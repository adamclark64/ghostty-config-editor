# ghostty-config-editor

## 0.2.0

### Minor Changes

- [#1](https://github.com/adamclark64/ghostty-config-editor/pull/1) [`d0234e4`](https://github.com/adamclark64/ghostty-config-editor/commit/d0234e4fd480969f6bad3b09ed6df01b51c72599) Thanks [@adamclark64](https://github.com/adamclark64)! - Set up automated release pipeline and fix theme-apply state sync.

  - Add Changesets + Conventional Commits enforcement (commitlint, husky, CI check).
  - Add `Release` workflow that opens/merges the "Version Packages" PR and tags versions on `main`.
  - Add `Publish DMG` workflow that builds signed (when secrets present) `.dmg` artifacts for Apple Silicon and Intel on each `v*` tag and uploads them to the GitHub Release.
  - Fix: picking a theme from the gallery now immediately reflects in the field editor and no longer re-enables `Save & Reload` with stale pre-theme values — so clicking `Keep` then saving keeps the theme instead of reverting to the session-start config.
