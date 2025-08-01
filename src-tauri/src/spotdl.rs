// pub async fn init_download(data_dir: String) {
//     if check_spotdl_binary_exists(&data_dir) {
//         info!("[spotdl] spotdl binary already exists at: {data_dir}");
//         return;
//     }
//
//     info!("[spotdl] Starting spotdl binary download...");
//
//     let platform = tauri_plugin_os::platform();
//
//     info!("[spotdl] Detected platform: {platform}");
//
//     let (test_passed, download_url) = platform_test(platform);
//
//     if !test_passed {
//         panic!("[spotdl] Unsupported platform: {platform}");
//     }
//
//     download_spotdl_binary(download_url.expect("awd"), data_dir)
//         .await
//         .expect("Failed to download spotdl binary");
//
//     info!("[spotdl] Downloaded spotdl binary successfully");
// }

// fn platform_test(platform: &str) -> (bool, Option<String>) {
//     //let spotdl_version = "4.2.11";
//     match platform {
//         "linux" => {
//             log::info!("[spotdl] Linux platform test passed.");
//             (true, Some("https://github.com/spotDL/spotify-downloader/releases/download/v4.2.11/spotdl-4.2.11-linux".to_string()))
//         }
//         "macos" => {
//             log::info!("[spotdl] MacOS platform test passed.");
//             (true, Some("https://github.com/spotDL/spotify-downloader/releases/download/v4.2.11/spotdl-4.2.11-darwin".to_string()))
//         }
//         "windows" => {
//             log::info!("[spotdl] Windows platform test passed.");
//             (true, Some("https://github.com/spotDL/spotify-downloader/releases/download/v4.2.11/spotdl-4.2.11-win32.exe".to_string()))
//         }
//         _ => {
//             log::warn!("[spotdl] Unsupported platform: {platform}");
//             (false, None)
//         }
//     }
// }
//
//use std::fs;
//use tauri_plugin_http::reqwest::get;
//
//async fn download_spotdl_binary(url: String, save_path: String) -> Result<(), String> {
//    let res = get(&url).await;
//    if res.is_err() {
//        return Err(format!(
//            "Failed to download spotdl binary: {}",
//            res.unwrap_err()
//        ));
//    }
//
//    log::info!("[spotdl] Binary downloaded");
//
//    fs::create_dir_all("bin").map_err(|e| e.to_string())?;
//    fs::write(
//        format!("{}/spotdl", save_path),
//        res.unwrap().bytes().await.map_err(|e| e.to_string())?,
//    )
//    .map_err(|e| e.to_string())?;
//
//    // Make the binary executable (on Unix)
//    #[cfg(unix)]
//    {}
//
//    Ok(())
//}
//
// use std::fs;
// #[cfg(unix)]
// use std::os::unix::fs::PermissionsExt;
// use tauri_plugin_http::reqwest::get;
//
// async fn download_spotdl_binary(url: String, save_path: String) -> Result<(), String> {
//     let res = get(&url).await;
//     if let Err(e) = res {
//         return Err(format!("Failed to download spotdl binary: {e}"));
//     }
//     let resp = res.unwrap();
//
//     log::info!("[spotdl] Binary downloaded");
//
//     fs::create_dir_all(&save_path).map_err(|e| e.to_string())?;
//
//     let out_path = format!("{save_path}/spotdl");
//     let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
//     fs::write(&out_path, bytes).map_err(|e| e.to_string())?;
//
//     #[cfg(unix)]
//     {
//         let mut perms = fs::metadata(&out_path)
//             .map_err(|e| e.to_string())?
//             .permissions();
//         perms.set_mode(0o755);
//         fs::set_permissions(&out_path, perms).map_err(|e| e.to_string())?;
//     }
//
//     Ok(())
// }
//
// fn check_spotdl_binary_exists(save_path: &str) -> bool {
//     #[cfg(unix)]
//     {
//         let out_path = format!("{save_path}/spotdl");
//         if fs::metadata(&out_path).is_err() {
//             return false;
//         }
//         let perms = fs::metadata(&out_path).unwrap().permissions();
//         perms.mode() & 0o111 != 0
//     }
//     #[cfg(windows)]
//     {
//         let out_path = format!("{save_path}/spotdl.exe");
//         fs::metadata(&out_path).is_ok()
//     }
// }

use log::info;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub fn check_spotdl_exists() -> bool {
    use which::which;

    match which("spotdl") {
        Ok(_) => {
            info!("[spotdl] spotdl binary exists in PATH");
            true
        }
        Err(e) => {
            info!("[spotdl] spotdl binary does not exist in PATH: {e}");
            false
        }
    }
}

fn get_settings(
    app_handle: &AppHandle,
) -> Result<(String, String, String), Box<dyn std::error::Error>> {
    let store = app_handle.store("settings.json")?;

    let mut spotify_url = store
        .get("spotify_url")
        .expect("Failed to get spotify_url from store")
        .to_string();
    spotify_url = spotify_url.trim_matches('"').to_string();

    let mut data_dir = store
        .get("data_dir")
        .expect("Failed to get data_dir from store")
        .to_string();
    store.close_resource();
    data_dir = data_dir.trim_matches('"').to_string();

    let mut default_dir = store
        .get("default_dir")
        .expect("Failed to get data_dir from store")
        .to_string();
    store.close_resource();
    default_dir = default_dir.trim_matches('"').to_string();

    store.close_resource();

    Ok((spotify_url.to_string(), data_dir, default_dir))
}

#[tauri::command]
pub fn download_playlist(app_handle: AppHandle) {
    info!("[spotdl] Starting playlist download...");

    let (spotify_url, data_dir, default_dir) =
        get_settings(&app_handle).expect("Failed to get spotify_url from store");

    info!(
        "[spotdl] Spotify URL: {} , Data_dir: {}",
        &spotify_url, &data_dir
    );

    tauri::async_runtime::spawn(async move {
        exec_spotdl(&spotify_url, &data_dir, &default_dir).expect("Failed to execute spotdl");
    });
}

use std::env;
fn exec_spotdl(spotify_url: &str, _data_dir: &str, default_dir: &str) -> Result<(), String> {
    use std::process::{Command, Stdio};

    match env::set_current_dir(default_dir) {
        Ok(_) => info!("Successfully changed the working directory to {default_dir}"),
        Err(e) => info!("Error changing directory: {e}"),
    }

    let mut output = Command::new("spotdl")
        .arg("download")
        .arg(spotify_url)
        .stdout(Stdio::inherit())
        .spawn()
        .map_err(|e| format!("Failed to execute spotdl: {e}"))?;

    let _ = output
        .wait()
        .map_err(|e| format!("Failed to wait for spotdl: {e}"))?;

    Ok(())
}
