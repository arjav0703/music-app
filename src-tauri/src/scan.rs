//use lofty::{probe,d};
use lofty::file::TaggedFileExt;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use serde::Serialize;
use std::fs;

#[derive(Serialize)]
pub struct TrackMetadata {
    pub name: String,
    pub path: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
}

#[tauri::command]
pub fn scan_folder(path: String) -> Vec<TrackMetadata> {
    let mut tracks = vec![];

    if let Ok(entries) = fs::read_dir(&path) {
        for entry in entries.flatten() {
            let path_buf = entry.path();
            if path_buf.is_file() {
                if let Some(ext) = path_buf.extension().and_then(|e| e.to_str()) {
                    let ext = ext.to_lowercase();
                    if ["mp3", "flac", "wav", "ogg", "m4a"].contains(&ext.as_str()) {
                        let file_path = path_buf.to_string_lossy().to_string();
                        let name = path_buf
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string();

                        let mut title = None;
                        let mut artist = None;
                        let mut album = None;

                        if let Ok(tagged_file) = Probe::open(&file_path).and_then(|p| p.read()) {
                            if let Some(tag) = tagged_file.primary_tag() {
                                title = tag.title().map(|s| s.to_string());
                                artist = tag.artist().map(|s| s.to_string());
                                album = tag.album().map(|s| s.to_string());
                            }
                        }

                        tracks.push(TrackMetadata {
                            name,
                            path: file_path,
                            title,
                            artist,
                            album,
                        });
                    }
                }
            }
        }
    }

    tracks
}
