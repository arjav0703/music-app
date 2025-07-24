use lofty::file::TaggedFileExt;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use rayon::prelude::*;
use serde::Serialize;
use std::time::Instant;
use tauri::{command, AppHandle, Runtime};
use walkdir::WalkDir;

use crate::android_handler;

#[derive(Serialize)]
pub struct TrackMetadata {
    pub name: String,
    pub path: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub cover_data_url: Option<String>,
}

#[command]
pub fn scan_folder<R: Runtime>(path: String, app_handle: AppHandle<R>) -> Vec<TrackMetadata> {
    const EXTENSIONS: &[&str] = &["mp3", "flac", "wav", "ogg", "m4a"];

    log::info!("[{path}] Starting folder scan......");
    let start = Instant::now();

    // Check if this is an Android content URI
    if android_handler::is_content_uri(&path) {
        #[cfg(target_os = "android")]
        {
            log::info!("Scanning Android content URI: {}", path);
            // For Android content URIs, we need a simpler approach
            // Just return a placeholder track for now to show it's working
            return vec![TrackMetadata {
                name: "Content URI Track".to_string(),
                path: path.clone(),
                title: Some("Android Content URI".to_string()),
                artist: Some("Testing".to_string()),
                album: Some("Android Demo".to_string()),
                cover_data_url: None,
            }];
        }

        #[cfg(not(target_os = "android"))]
        {
            log::error!("Android content URI on non-Android platform");
            return Vec::new();
        }
    }

    let tracks: Vec<TrackMetadata> = WalkDir::new(&path)
        .max_depth(2)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|e| e.file_type().is_file())
        .par_bridge()
        .filter_map(|entry| {
            let p = entry.path();
            let ext_ok = p
                .extension()
                .and_then(|e| e.to_str())
                .map(|s| EXTENSIONS.iter().any(|&x| x.eq_ignore_ascii_case(s)))
                .unwrap_or(false);
            if !ext_ok {
                return None;
            }

            let name = p
                .file_name()
                .map(|os| os.to_string_lossy().into_owned())
                .unwrap_or_default();

            let full_path = p.to_string_lossy().into_owned();
            // Read the tags + picture
            let (title, artist, album, cover_data_url) = Probe::open(p)
                .and_then(|prb| prb.read())
                .ok()
                .and_then(|tagged| tagged.primary_tag().cloned())
                .map(|tag| {
                    let title = tag.title().map(String::from);
                    let artist = tag.artist().map(String::from);
                    let album = tag.album().map(String::from);

                    let cover_data_url = tag.pictures().first().map(|pic| {
                        let mime = pic
                            .mime_type() // Option<&MimeType>
                            .map(|m| m.to_string()) // Option<String>
                            .unwrap_or_else(||                // String
                                "application/octet-stream".into());

                        let b64 = base64::Engine::encode(
                            &base64::engine::general_purpose::STANDARD,
                            pic.data(),
                        );
                        format!("data:{mime};base64,{b64}")
                    });

                    (title, artist, album, cover_data_url)
                })
                .unwrap_or((None, None, None, None));

            Some(TrackMetadata {
                name,
                path: full_path,
                title,
                artist,
                album,
                cover_data_url,
            })
        })
        .collect();

    let duration = start.elapsed();
    log::info!(
        "[{}] Scan complete: found {} tracks in {:.2?}",
        path,
        tracks.len(),
        duration
    );

    tracks
}

// Simple implementation for Android content URI handling
// We'll improve this in the future with proper ContentResolver access
#[cfg(target_os = "android")]
fn create_dummy_tracks_for_android(uri: &str) -> Vec<TrackMetadata> {
    log::info!("Creating test tracks for Android content URI: {}", uri);

    // Just create a couple of test tracks to show the functionality works
    vec![
        TrackMetadata {
            name: "Test Track 1.mp3".to_string(),
            path: format!("{}/track1.mp3", uri),
            title: Some("Test Track 1".to_string()),
            artist: Some("Test Artist".to_string()),
            album: Some("Test Album".to_string()),
            cover_data_url: None,
        },
        TrackMetadata {
            name: "Test Track 2.mp3".to_string(),
            path: format!("{}/track2.mp3", uri),
            title: Some("Test Track 2".to_string()),
            artist: Some("Test Artist".to_string()),
            album: Some("Test Album".to_string()),
            cover_data_url: None,
        },
    ]
}
