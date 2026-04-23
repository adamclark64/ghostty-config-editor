---
"ghostty-config-editor": minor
---

Set up automated release pipeline and fix theme-apply state sync.

- Add Changesets + Conventional Commits enforcement (commitlint, husky, CI check).
- Add `Release` workflow that opens/merges the "Version Packages" PR and tags versions on `main`.
- Add `Publish DMG` workflow that builds signed (when secrets present) `.dmg` artifacts for Apple Silicon and Intel on each `v*` tag and uploads them to the GitHub Release.
- Fix: picking a theme from the gallery now immediately reflects in the field editor and no longer re-enables `Save & Reload` with stale pre-theme values — so clicking `Keep` then saving keeps the theme instead of reverting to the session-start config.
