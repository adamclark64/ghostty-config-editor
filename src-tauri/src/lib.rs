mod commands;
mod config_io;
mod config_parser;
mod ghostty_cli;
mod schema;
mod session;
mod themes;

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Capture a session baseline on every app launch. If this fails (no
    // config file yet, Ghostty not installed, etc.) we proceed silently —
    // the UI will reflect the absence via `session_status`.
    let _ = session::capture_at_launch();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::get_schema,
            commands::get_config_path,
            commands::read_config,
            commands::write_config,
            commands::validate_config,
            commands::list_themes,
            commands::list_fonts,
            commands::list_actions,
            commands::list_backups,
            commands::restore_backup,
            commands::reload_ghostty,
            commands::list_theme_previews,
            commands::session_status,
            commands::revert_session,
            commands::keep_session,
            commands::save_and_reload,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
