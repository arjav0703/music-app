use std::fs;
use std::path::{Path, PathBuf};
use tauri::{command, AppHandle};
use walkdir::WalkDir;
//
//const AUDIO_EXTENSIONS: &[&str] = &[
//    "mp3", "wav", "flac", "aac", "ogg", "m4a", "wma", "opus", "aiff", "alac",
//];
//
//#[command]
//pub async fn scan_folder(path: String, app: AppHandle) -> Result<Vec<(String, String)>, String> {
//    let path_buf = PathBuf::from(&path);
//
//    // path validation
//    if !path_buf.exists() {
//        return Err("Path does not exist".into());
//    }
//    if !path_buf.is_dir() {
//        return Err("Path is not a directory".into());
//    }
//
//    let mut audio_files = Vec::new();
//
//    // Recursive directory walker
//    for entry in WalkDir::new(&path)
//        .follow_links(true)
//        .into_iter()
//        .filter_map(|e| e.ok())
//    {
//        if entry.file_type().is_file() {
//            if let Some(ext) = entry.path().extension().and_then(|e| e.to_str()) {
//            if AUDIO_EXTENSIONS.contains(&ext.to_lowercase().as_str()) {
//                if let (Some(name), Some(path)) =
//                    (entry.file_name().to_str(), entry.path().to_str())
//                {
//                    audio_files.push((name.to_string(), path.to_string()));
//                }
//            }
//        }
//    }
//}

//tauri::async_runtime::spawn(async move {
//    let _ = app.emit_all(
//        "scan_result",
//        format!("Found {} audio files", audio_files.len()),
//    );
//});
//
//    Ok(audio_files)
//}

#[tauri::command]
pub fn scan_folder(path: String) -> tauri::Result<Vec<ScanEntry>> {
    let mut entries = Vec::new();
    for entry in fs::read_dir(path)? {
        let path = entry?.path();
        if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
            if ["mp3", "wav", "flac", "m4a", "ogg"].contains(&ext) {
                entries.push(ScanEntry {
                    name: path
                        .file_name()
                        .and_then(|s| s.to_str())
                        .unwrap_or_default()
                        .to_string(),
                    path: path.to_string_lossy().to_string(),
                });
            }
        }
    }
    Ok(entries)
}

#[derive(serde::Serialize)]
pub struct ScanEntry {
    name: String,
    path: String,
}
