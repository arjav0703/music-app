use log::{error, info};
use std::path::Path;
use tauri::{command, AppHandle, Manager, Runtime};

#[cfg(target_os = "android")]
use std::fs;

/// Android specific implementation for picking a folder
/// Returns a content URI that can be used to access the folder
#[command]
pub async fn android_pick_folder<R: Runtime>(app_handle: AppHandle<R>) -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        info!("Android folder picker invoked");

        let activity = match app_handle.android_app().unwrap().activity() {
            Some(activity) => activity,
            None => return Err("Failed to get Android activity".into()),
        };

        // Create intent for folder selection
        let intent = match android_intent::Intent::new()
            .action("android.intent.action.OPEN_DOCUMENT_TREE")
            .flags(
                android_intent::flags::FLAG_GRANT_READ_URI_PERMISSION
                    | android_intent::flags::FLAG_GRANT_PERSISTABLE_URI_PERMISSION,
            )
            .build()
        {
            Ok(intent) => intent,
            Err(e) => return Err(format!("Failed to create intent: {}", e)),
        };

        // Start activity for result
        const REQUEST_CODE: i32 = 42;
        activity
            .start_activity_for_result(intent, REQUEST_CODE)
            .map_err(|e| e.to_string())?;

        // Register event handler for when activity result comes back
        let app_handle_clone = app_handle.clone();
        tauri::async_runtime::spawn(async move {
            match app_handle_clone.once_global("android-activity-result", move |event| {
                if let Some(result) = event.payload().as_object() {
                    if let (Some(request_code), Some(result_code), Some(data)) = (
                        result.get("requestCode").and_then(|v| v.as_i64()),
                        result.get("resultCode").and_then(|v| v.as_i64()),
                        result.get("data"),
                    ) {
                        if request_code == REQUEST_CODE as i64 && result_code >= 0 {
                            if let Some(uri) = data.as_str() {
                                // Emit an event with the selected folder URI
                                if let Err(e) =
                                    app_handle_clone.emit_all("android-folder-selected", uri)
                                {
                                    error!("Failed to emit folder selected event: {}", e);
                                }
                            }
                        } else {
                            // User cancelled or something went wrong
                            if let Err(e) = app_handle_clone
                                .emit_all("android-folder-selected", "android://cancelled")
                            {
                                error!("Failed to emit folder cancelled event: {}", e);
                            }
                        }
                    }
                }
            }) {
                Ok(_) => info!("Registered android-activity-result handler"),
                Err(e) => error!("Failed to register event handler: {}", e),
            }
        });

        // Return a placeholder that will be updated with the actual URI
        Ok("android://pending-folder-selection".to_string())
    }

    #[cfg(not(target_os = "android"))]
    {
        info!("Android folder picker called on non-Android platform");
        Err("This function is only available on Android".into())
    }
}

#[cfg(target_os = "android")]
#[command]
pub fn handle_android_folder_result(uri: String) -> Result<String, String> {
    info!("Android folder selection result: {}", uri);

    // Process the content URI
    // Take the URI from the Android document picker and make it usable
    // We may need to persist permissions

    // For now, we'll just return the URI as is
    // The scanning logic will need to be updated to handle content URIs
    Ok(uri)
}

/// Creates a writable temp directory for Android that can be used for music files
#[cfg(target_os = "android")]
#[command]
pub fn get_android_music_dir(app_handle: AppHandle) -> Result<String, String> {
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Failed to get cache dir: {}", e))?;

    let music_dir = cache_dir.join("music");

    // Create the directory if it doesn't exist
    if !Path::new(&music_dir).exists() {
        fs::create_dir_all(&music_dir)
            .map_err(|e| format!("Failed to create music directory: {}", e))?;
    }

    Ok(music_dir.to_string_lossy().into_owned())
}

/// Helper function to check if a path is a content URI
pub fn is_content_uri(path: &str) -> bool {
    path.starts_with("content://")
}
