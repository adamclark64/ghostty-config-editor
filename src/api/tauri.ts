import { invoke } from "@tauri-apps/api/core";
import type {
  BackupInfo,
  ConfigEntry,
  ConfigKey,
  ConfigPaths,
  SaveReloadResult,
  SessionStatus,
  ThemePreview,
  ValidationResult,
} from "@/types";

export const api = {
  getSchema: () => invoke<ConfigKey[]>("get_schema"),
  getConfigPath: () => invoke<ConfigPaths>("get_config_path"),
  readConfig: () => invoke<ConfigEntry[]>("read_config"),
  writeConfig: (entries: ConfigEntry[]) =>
    invoke<string>("write_config", { entries }),
  validateConfig: (entries: ConfigEntry[]) =>
    invoke<ValidationResult>("validate_config", { entries }),
  listThemes: () => invoke<string[]>("list_themes"),
  listFonts: () => invoke<string[]>("list_fonts"),
  listActions: () => invoke<string[]>("list_actions"),
  listBackups: () => invoke<BackupInfo[]>("list_backups"),
  readFileEntries: (path: string) =>
    invoke<ConfigEntry[]>("read_file_entries", { path }),
  writeFileEntries: (path: string, entries: ConfigEntry[]) =>
    invoke<void>("write_file_entries", { path, entries }),
  restoreBackup: (path: string) => invoke<void>("restore_backup", { path }),
  reloadGhostty: () => invoke<void>("reload_ghostty"),
  listThemePreviews: () => invoke<ThemePreview[]>("list_theme_previews"),
  sessionStatus: () => invoke<SessionStatus>("session_status"),
  revertSession: () => invoke<string>("revert_session"),
  keepSession: () => invoke<void>("keep_session"),
  saveAndReload: (entries: ConfigEntry[], reload: boolean) =>
    invoke<SaveReloadResult>("save_and_reload", { entries, reload }),
};
