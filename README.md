# Ghostty Config Editor

A macOS desktop app for editing, validating, and reloading [Ghostty](https://ghostty.org) configuration through a visual UI driven by Ghostty's own schema.

- Auto-discovers all 580 config keys by parsing `ghostty +show-config --default --docs`
- Infers widget type (boolean, number, color, enum, list, etc.) from each key's default value and inline docs
- Validates changes via `ghostty +validate-config` before writing
- Writes timestamped `.bak-*` backups on every save
- Restores backups with a single click
- Follows symlinks so it works whether your config is stored in its default location or a dotfiles repo

Built with **Tauri 2** (Rust) + **React + Vite + TypeScript** + **TanStack Query** + **Tailwind**.

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

A flat-color placeholder icon ships in `src-tauri/icons/`. To replace with a real icon:

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
  config_io.rs         symlink-aware read/write + backup
  config_parser.rs     tokenizes the config file preserving order/comments
  commands.rs          #[tauri::command] handlers exposed to the frontend

src/
  App.tsx              top-level layout
  api/tauri.ts         typed invoke() wrappers
  components/          FieldRenderer + widgets + panels
  hooks/               TanStack Query hooks
  types.ts             frontend mirror of Rust types
```

## Verification

After `pnpm tauri dev`:

1. Change `font-size` from 14 to 15, click **Save**.
2. Confirm a `.bak-YYYYMMDD-HHMMSS` file now exists alongside your config.
3. Open a new Ghostty window (or press ⌘⇧, in an existing one) — the new size applies.
4. Set `font-size = not-a-number` and try saving — the red validation banner should block the write.
5. Open **Backups**, restore the one from step 2, confirm the font-size reverts.
