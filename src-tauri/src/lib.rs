// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod scan;
use log::info;
use scan::scan_folder;
mod spotdl;
use spotdl::download_playlist;
use std::fs;
use tauri_plugin_store::StoreExt;
//use serde_json::json;
//use tauri::Wry;
//use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
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
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        //.setup(|app| {
        //    let store = app.store("settings.json")?;
        //    let data_dir = app.data_dir();
        //
        //    let spotify_utl = store
        //        .get("spotify_url")
        //        .expect("Failed to get value from store");
        //    println!("{}", spotify_utl); // {"value":5}
        //
        //    // Remove the store from the resource table
        //    store.close_resource();
        //
        //    Ok(())
        //})
        .invoke_handler(tauri::generate_handler![
            load_file_bytes,
            scan_folder,
            catch_data_dir,
            //start_downloading,
            download_playlist
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn load_file_bytes(path: String) -> Result<Vec<u8>, String> {
    info!("[load_file_bytes] reading: {path}");
    match fs::read(&path) {
        Ok(data) => Ok(data),
        Err(e) => {
            info!("[load_file_bytes] Failed to read file: {path} ({e})");
            Err(format!("[load_file_bytes] failed to read file: {e}"))
        }
    }
}

#[tauri::command]
async fn catch_data_dir(invoke_message: String, app_handle: tauri::AppHandle) {
    let data_dir = invoke_message;
    info!("catch data dir invoke; data_dir: {data_dir}");

    let store = app_handle.store("settings.json").unwrap();
    store.set("data_dir", data_dir.clone());
    store.save().unwrap();
    store.close_resource();
    //
    // tauri::async_runtime::spawn(async move {
    //     spotdl::init_download(data_dir).await;
    // });
}

//#[tauri::command]
//fn start_downloading() {
//    info!("[start_downloading] Starting download process");
//}
