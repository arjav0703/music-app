pub fn init_download() {
    let platform = tauri_plugin_os::platform();

    let (test_passed, download_url) = platform_test(platform);
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
