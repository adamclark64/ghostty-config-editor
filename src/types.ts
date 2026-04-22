// Mirrors the Rust types serialized over tauri::invoke.

export type WidgetType =
  | { kind: "bool" }
  | { kind: "number" }
  | { kind: "color" }
  | { kind: "enum"; values: string[] }
  | { kind: "theme" }
  | { kind: "font-family" }
  | { kind: "keybind" }
  | { kind: "list" }
  | { kind: "text" };

export interface ConfigKey {
  name: string;
  docs: string;
  defaults: string[];
  group: string;
  widget: WidgetType;
}

export type ConfigEntry =
  | { kind: "entry"; key: string; value: string }
  | { kind: "comment"; text: string }
  | { kind: "blank" };

export interface ConfigPaths {
  logical: string;
  real: string;
}

export interface ValidationResult {
  ok: boolean;
  message: string;
}

export interface BackupInfo {
  path: string;
  stamp: string;
  size: number;
}

export interface SessionStatus {
  baseline_exists: boolean;
  baseline_mtime: number | null;
  is_modified: boolean;
  baseline_path: string;
}

export interface SaveReloadResult {
  backup_path: string;
  reload_ok: boolean;
  reload_error: string | null;
}

export interface ThemePreview {
  name: string;
  /** 16 palette slots; missing entries are empty strings. */
  palette: string[];
  background: string | null;
  foreground: string | null;
  cursor_color: string | null;
  selection_background: string | null;
  selection_foreground: string | null;
}
