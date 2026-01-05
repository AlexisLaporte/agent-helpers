#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use claude_code_manager_lib::{
    list_files, list_dir, read_file_content, write_file_content,
    find_all_claude_projects, start_watching, stop_watching, delete_path,
    get_project_view, create_file_with_content,
    FileEntry, ClaudeProject, ProjectView
};
#[allow(unused_imports)]
use tauri::{AppHandle, Manager};
#[cfg(feature = "tray")]
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    WindowEvent,
};

#[tauri::command]
fn list_claude_files() -> Vec<FileEntry> {
    list_files()
}

#[tauri::command]
fn list_directory(path: String) -> Vec<FileEntry> {
    list_dir(&path)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    read_file_content(&path)
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    write_file_content(&path, &content)
}

#[tauri::command]
fn get_all_projects(force_refresh: bool) -> Vec<ClaudeProject> {
    find_all_claude_projects(force_refresh)
}

#[tauri::command]
fn watch_directory(app: AppHandle, path: String) -> Result<(), String> {
    stop_watching();
    start_watching(app, &path)
}

#[tauri::command]
fn unwatch_directory() {
    stop_watching();
}

#[tauri::command]
fn delete_item(path: String) -> Result<(), String> {
    delete_path(&path)
}

#[tauri::command]
fn get_view(claude_path: String, project_path: String, is_global: bool) -> ProjectView {
    get_project_view(&claude_path, &project_path, is_global)
}

#[tauri::command]
fn create_file(path: String, content: String) -> Result<(), String> {
    create_file_with_content(&path, &content)
}

#[cfg(feature = "tray")]
fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Claude Code Manager")
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;
    Ok(())
}

fn main() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    #[cfg(feature = "tray")]
    {
        builder = builder
            .setup(|app| {
                setup_tray(app)?;
                Ok(())
            })
            .on_window_event(|window, event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    let _ = window.hide();
                    api.prevent_close();
                }
            });
    }

    builder
        .invoke_handler(tauri::generate_handler![
            list_claude_files,
            list_directory,
            read_file,
            write_file,
            get_all_projects,
            watch_directory,
            unwatch_directory,
            delete_item,
            get_view,
            create_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
