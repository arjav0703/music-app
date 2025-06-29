use lofty::file::TaggedFileExt;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use rayon::prelude::*;
use serde::Serialize;
use std::time::Instant;
use tauri::command;
use walkdir::WalkDir;

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
pub fn scan_folder(path: String) -> Vec<TrackMetadata> {
    const EXTENSIONS: &[&str] = &["mp3", "flac", "wav", "ogg", "m4a"];

    println!("[{}] Starting folder scan......", path);
    let start = Instant::now();

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

                        let b64 = base64::encode(pic.data());
                        format!("data:{};base64,{}", mime, b64)
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
    println!(
        "[{}] Scan complete: found {} tracks in {:.2?}",
        path,
        tracks.len(),
        duration
    );

    tracks
}
