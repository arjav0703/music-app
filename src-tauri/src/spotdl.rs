pub fn init_download() {
    let platform = tauri_plugin_os::platform();

    let (test_passed, download_url) = platform_test(platform);
    download_spotdl_binary(download_url.expect("awd"), "spotdl".to_string())
        .expect("Failed to download spotdl binary");
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

//use reqwest::blocking::get;
use std::fs::File;
use std::io::copy;
use std::path::Path;
use tauri_plugin_http::reqwest::get;

fn download_spotdl_binary(url: String, save_path: String) -> Result<(), String> {
    let mut resp = get(&url).map_err(|e| e.to_string())?;
    let mut out = File::create(&save_path).map_err(|e| e.to_string())?;
    copy(&mut resp, &mut out).map_err(|e| e.to_string())?;

    // Make the binary executable (on Unix)
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = out.metadata().map_err(|e| e.to_string())?.permissions();
        perms.set_mode(0o755);
        std::fs::set_permissions(&save_path, perms).map_err(|e| e.to_string())?;
    }
    Ok(())
}
