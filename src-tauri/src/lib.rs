// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod scan;
use scan::scan_folder;
use std::fs;
use tauri_plugin_fs::FsExt;
//use serde_json::json;
//use tauri::Wry;
//use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    },
                ))
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        //.setup(|app| {
        //    let scope = app.fs_scope();
        //    scope.allow_directory("dir", false);
        //    dbg!(scope.is_allowed("dir"));
        //
        //    Ok(())
        //})
        .invoke_handler(tauri::generate_handler![load_file_bytes, scan_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn load_file_bytes(path: String) -> Result<Vec<u8>, String> {
    println!("[load_file_bytes] reading: {}", path);
    match fs::read(&path) {
        Ok(data) => Ok(data),
        Err(e) => {
            eprintln!("[load_file_bytes] Failed to read file: {} ({})", path, e);
            Err(format!("[load_file_bytes] failed to read file: {}", e))
        }
    }
}
