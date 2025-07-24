// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod scan;
use log::{error, info};
use scan::scan_folder;
mod android_handler;
mod spotdl;
#[cfg(not(any(target_os = "android")))]
use spotdl::check_spotdl_exists;
#[cfg(not(any(target_os = "android")))]
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
        .setup(|app| {
            #[cfg(target_os = "android")]
            {
                // Register mobile-specific event handlers
                let app_handle = app.handle();

                // Handle activity results from Android
                app.listen_global("android-activity-result", move |event| {
                    if let Some(payload) = event.payload() {
                        info!("Received Android activity result: {}", payload);
                        // Forward the event to our handler
                        if let Err(e) = app_handle.emit("android-activity-result", payload) {
                            error!("Failed to forward android-activity-result: {}", e);
                        }
                    }
                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin({
            #[cfg(not(any(target_os = "android")))]
            {
                tauri_plugin_global_shortcut::Builder::new().build()
            }
            #[cfg(any(target_os = "android"))]
            {
                tauri_plugin_store::Builder::new().build() // Dummy plugin that will be overwritten
            }
        })
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
            load_android_content_uri,
            scan_folder,
            catch_data_dir,
            //start_downloading,
            android_handler::android_pick_folder,
            #[cfg(target_os = "android")]
            android_handler::handle_android_folder_result,
            #[cfg(target_os = "android")]
            android_handler::get_android_music_dir,
            #[cfg(target_os = "android")]
            android_handler::is_content_uri,
            #[cfg(not(any(target_os = "android")))]
            check_spotdl_exists,
            #[cfg(not(any(target_os = "android")))]
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
async fn load_android_content_uri(uri: String) -> Result<Vec<u8>, String> {
    #[cfg(target_os = "android")]
    {
        use jni::objects::{JObject, JString};
        use tauri::api::JniHandle;

        info!("[load_android_content_uri] reading: {uri}");

        let handle = match JniHandle::get() {
            Ok(handle) => handle,
            Err(e) => return Err(format!("Failed to get JNI handle: {e}")),
        };

        let env = handle.env();
        let uri_jstring = env
            .new_string(&uri)
            .map_err(|e| format!("Failed to create Java string: {e}"))?;

        let helper_class = env
            .find_class("dev/musik/app/ContentUriHelper")
            .map_err(|e| format!("Failed to find ContentUriHelper class: {e}"))?;

        let bytes = env
            .call_static_method(
                helper_class,
                "readContentUri",
                "(Ljava/lang/String;)[B",
                &[uri_jstring.into()],
            )
            .map_err(|e| format!("Failed to call readContentUri: {e}"))?;

        let bytes_array = bytes
            .l()
            .map_err(|e| format!("Failed to convert to byte array: {e}"))?;

        let length = env
            .get_array_length(bytes_array.into_raw())
            .map_err(|e| format!("Failed to get array length: {e}"))?;

        let mut result = vec![0u8; length as usize];
        env.get_byte_array_region(bytes_array.into_raw(), 0, &mut result)
            .map_err(|e| format!("Failed to copy byte array: {e}"))?;

        Ok(result)
    }

    #[cfg(not(target_os = "android"))]
    {
        info!("Android content URI called on non-Android platform: {uri}");
        Err("This function is only available on Android".into())
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
