---
"ghostty-config-editor": minor
---

Rewrite the editor UI around a visual, section-based workflow.

- Design-token system (CSS variables) with automatic dark/light tracking and a manual system/light/dark toggle in the titlebar.
- Four-pane shell (titlebar, sidebar, section editor, preview) — all panes are resizable, sidebar and preview are collapsible, and the Live Preview card inside the preview pane is vertically resizable. Widths and heights persist across sessions.
- Twelve section editors with section-specific visual affordances: theme card strip, sticky "Browse all →" button, full 256-color palette grid (standard / color cube / grayscale), font specimen cards, cursor style tiles, window padding/opacity visualization, keycap rows with a chord-capture modal, and more.
- Inline color editing everywhere — `ColorSwatch` opens a portalled HSV picker (fixes a bug where the saturation-value plane was using HSL semantics and rendered the top-right corner as white).
- Preview pane: live terminal mock, WCAG AA contrast readout, validation card, and per-key diff with per-slot rendering for `palette` and per-chord rendering for `keybind`.
- Docs links on every field, sourced from the ghostty schema and shown via a hover popover.
- `Backups` panel restored and restyled; titlebar wires Compare / Revert / Validate / Save & Reload to the existing Tauri commands.
- Community themes: new Rust command `list_remote_themes` fetches and caches the `mbadolato/iTerm2-Color-Schemes` ghostty folder (24h TTL, offline fallback). The theme browser shows them as a distinct section with an "Apply as explicit palette" action.
- Parser round-trip test locks the guarantee that unknown keys and repeated `palette` / `keybind` entries survive a parse → serialize cycle.
