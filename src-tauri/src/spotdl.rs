pub async fn init_download() {
    let platform = tauri_plugin_os::platform();

    log::info!("[spotdl] Detected platform: {}", platform);

    let (test_passed, download_url) = platform_test(platform);

    if !test_passed {
        panic!("[spotdl] Unsupported platform: {}", platform);
    }

    let app_config_dir = std::env::var("DOCUMENT");
    println!("[spotdl] App config directory: {:?}", app_config_dir);

    //download_spotdl_binary(download_url.expect("awd"), "spotdl".to_string())
    //    .await
    //    .expect("Failed to download spotdl binary");
}

fn platform_test(platform: &str) -> (bool, Option<String>) {
    //let spotdl_version = "4.2.11";
    match platform {
        "linux" => {
            log::info!("[spotdl] Linux platform test passed.");
            (true, Some("https://github.com/spotDL/spotify-downloader/releases/download/v4.2.11/spotdl-4.2.11-linux".to_string()))
        }
        "macos" => {
            log::info!("[spotdl] MacOS platform test passed.");
            (true, Some("https://github.com/spotDL/spotify-downloader/releases/download/v4.2.11/spotdl-4.2.11-darwin".to_string()))
        }
        "windows" => {
            log::info!("[spotdl] Windows platform test passed.");
            (true, Some("https://github.com/spotDL/spotify-downloader/releases/download/v4.2.11/spotdl-4.2.11-win32.exe".to_string()))
        }
        _ => {
            log::warn!("[spotdl] Unsupported platform: {}", platform);
            (false, None)
        }
    }
}

use log::debug;
use std::fs;
use tauri::path::BaseDirectory;
use tauri_plugin_http::reqwest::get;

async fn download_spotdl_binary(url: String, save_path: String) -> Result<(), String> {
    let res = get(&url).await;
    if res.is_err() {
        return Err(format!(
            "Failed to download spotdl binary: {}",
            res.unwrap_err()
        ));
    }

    log::info!("[spotdl] Binary downloaded");

    fs::create_dir_all("bin").map_err(|e| e.to_string())?;
    fs::write(
        format!("bin/{}", save_path),
        res.unwrap().bytes().await.map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    // Make the binary executable (on Unix)
    //#[cfg(unix)]
    //{
    //    use std::os::unix::fs::PermissionsExt;
    //    let mut perms = out.metadata().map_err(|e| e.to_string())?.permissions();
    //    perms.set_mode(0o755);
    //    std::fs::set_permissions(&save_path, perms).map_err(|e| e.to_string())?;
    //}
    Ok(())
}
