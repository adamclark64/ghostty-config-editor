# Ghostty Config Editor

A macOS desktop app for editing, validating, and reloading [Ghostty](https://ghostty.org) configuration through a visual UI driven by Ghostty's own schema.

- Auto-discovers all ~580 config keys by parsing `ghostty +show-config --default --docs`
- Purpose-built section editors (Font, Colors, Window, Cursor, Keybinds, …) instead of a flat field list
- Live preview pane with a terminal mock, WCAG-AA contrast check, validation card, and per-key diffs
- Inline HSV color picker (portalled), 256-color palette grid, and theme browser with community themes fetched from [mbadolato/iTerm2-Color-Schemes](https://github.com/mbadolato/iTerm2-Color-Schemes)
- Keycap-style keybind editor with a chord-capture modal
- Four-pane resizable shell — titlebar, sidebar, section editor, preview — with collapsible sides and layout persisted to localStorage
- Design tokens with light / dark / follow-system modes
- Validates changes via `ghostty +validate-config` before writing
- Writes timestamped `.bak-*` backups on every save and restores them with a single click
- Hot-reloads the running Ghostty session after save
- Import / export config files from the toolbar
- Follows symlinks, so it works whether your config lives in the default location or a dotfiles repo

Built with **Tauri 2** (Rust) + **React + Vite + TypeScript** + **TanStack Query** + plain CSS with design tokens.

## Prerequisites

- macOS
- [Ghostty.app](https://ghostty.org/download) installed at `/Applications/Ghostty.app`
- Rust (`cargo --version`)
- Node 20+ and `pnpm` (or `npm` / `bun`)

## First-time setup

```bash
pnpm install
pnpm tauri dev
```

The first `cargo build` will take a few minutes.

## Replacing the placeholder icon

The app ships with the Ghostty blueprint logo in `src-tauri/icons/`. To swap in your own:

```bash
# start from any square PNG (1024x1024 recommended)
pnpm tauri icon path/to/source.png
```

## Project layout

```
src-tauri/src/
  main.rs              entry point
  lib.rs               tauri setup, command registration
  ghostty_cli.rs       wraps the Ghostty CLI
  schema.rs            parses +show-config and infers widget types
  themes.rs            built-in theme discovery
  remote_themes.rs     fetches & caches iTerm2-Color-Schemes ghostty themes
  config_io.rs         symlink-aware read/write + backup
  config_parser.rs     tokenizes config preserving order, comments, and repeated keys
  session.rs           running-Ghostty discovery for hot reload
  commands.rs          #[tauri::command] handlers exposed to the frontend

src/
  App.tsx              top-level shell wiring
  api/tauri.ts         typed invoke() wrappers
  context/             ConfigContext — draft state, diffs, commits
  design/tokens.css    CSS variables and light/dark palettes
  hooks/               TanStack Query, color scheme, pane layout
  components/
    shell/             Titlebar, Sidebar, SectionEditor, PreviewPane, PaneHandle, Toast
    sections/          Font, Colors, Window, Cursor, Keybinds, Mouse, Scrollback, …
    primitives/        inputs, layout, ColorPicker, ColorSwatch, TerminalPreview, DocsLink
    BackupList.tsx     backup browser + restore
    ThemeGallery.tsx   built-in + community theme browser
    Icon.tsx           SVG icon set
  lib/                 color, palette, keybind, theme-preview, section helpers
  types.ts             frontend mirror of Rust types
```

## Verification

After `pnpm tauri dev`:

1. In the **Font** section, bump `font-size` from 14 to 15 and click **Save & Reload**.
2. Confirm a `.bak-YYYYMMDD-HHMMSS` file now exists alongside your config.
3. Open a new Ghostty window (or press ⌘⇧, in an existing one) — the new size applies.
4. Set `font-size` to `not-a-number`; the preview pane's validation card should block the write before save fires.
5. In **Colors**, click a palette slot and change it in the HSV picker — the live preview updates and the diff card lists just that slot.
6. In **Keybinds**, click **Add chord**, press a shortcut, and verify it round-trips through save / reload.
7. Open **Backups** from the titlebar, restore the one from step 2, confirm the font-size reverts.
