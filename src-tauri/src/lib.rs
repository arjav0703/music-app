// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod scan;
use log::info;
use scan::scan_folder;
mod spotdl;
use spotdl::check_spotdl_exists;
use spotdl::download_playlist;
use std::env;
use std::fs;
use tauri_plugin_cli::CliExt;
use tauri_plugin_store::StoreExt;
//use serde_json::json;
//use tauri::Wry;
//use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let log_level = match app.cli().matches() {
                Ok(matches) => {
                    if let Some(verbose_arg) = matches.args.get("verbose") {
                        let is_verbose = &matches
                            .args
                            .get("verbose")
                            .expect("verbose argument not found")
                            .value;

                        // let is_verbose = verbose_arg.value.as_str() == Some("true");
                        println!("[CLI] Verbose: {is_verbose}");
                        if is_verbose == "true" {
                            log::LevelFilter::Trace
                        } else {
                            log::LevelFilter::Info
                        }
                    } else {
                        log::LevelFilter::Info
                    }
                }
                Err(_) => log::LevelFilter::Info,
            };

            // println!("Logger init with level: {:?}", log_level);
            app.handle().plugin(
                tauri_plugin_log::Builder::new()
                    .targets([
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                            file_name: Some("logs".to_string()),
                        }),
                        tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    ])
                    .level(log_level)
                    .build(),
            )?;

            log::info!("Logger initialized with level: {:?}", log_level);

            Ok(())
        })
        // .plugin(
        //     tauri_plugin_log::Builder::new()
        //         .target(tauri_plugin_log::Target::new(
        //             tauri_plugin_log::TargetKind::LogDir {
        //                 file_name: Some("logs".to_string()),
        //             },
        //         ))
        //         .level(log::LevelFilter::Info)
        //         .build(),
        // )
        .plugin(tauri_plugin_cli::init())
        // .setup(|app| {
        //     match app.cli().matches() {
        //         // `matches` here is a Struct with { args, subcommand }.
        //         // `args` is `HashMap<String, ArgData>` where `ArgData` is a struct with { value, occurrences }.
        //         // `subcommand` is `Option<Box<SubcommandMatches>>` where `SubcommandMatches` is a struct with { name, matches }.
        //         Ok(matches) => {
        //             println!("{:?}", &matches);
        //             // let isVerbose = matches.args.get("verbose);
        //             let is_verbose = &matches
        //                 .args
        //                 .get("verbose")
        //                 .expect("verbose argument not found")
        //                 .value;
        //             println!("Verbose mode: {is_verbose}");
        //         }
        //         Err(_) => {}
        //     }
        //     Ok(())
        // })
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
            check_spotdl_exists,
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
