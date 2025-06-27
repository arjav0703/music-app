use lofty::file::TaggedFileExt;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use rayon::prelude::*;
use serde::Serialize;
// use std::path::Path;
use tauri::command;
use walkdir::WalkDir;

#[derive(Serialize)]
pub struct TrackMetadata {
    pub name: String,
    pub path: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
}

#[command]
pub fn scan_folder(path: String) -> Vec<TrackMetadata> {
    const EXTENSIONS: &[&str] = &["mp3", "flac", "wav", "ogg", "m4a"];

    // Walk only a single directory (depth = 1). Parallelize via par_bridge.
    WalkDir::new(&path)
        .max_depth(2)
        .into_iter()
        .filter_map(Result::ok) // drop unreadable entries
        .filter(|e| e.file_type().is_file()) // only files
        .par_bridge() // turn into a parallel iterator
        .filter_map(|entry| {
            let p = entry.path();

            let ext_ok = p
                .extension()
                .and_then(|e| e.to_str())
                .map(|s| s.eq_ignore_ascii_case(s) && EXTENSIONS.contains(&s))
                .unwrap_or(false);
            if !ext_ok {
                return None;
            }

            // capture the file name + full path
            let name = p
                .file_name()
                .map(|os| os.to_string_lossy().into_owned())
                .unwrap_or_default();
            let full_path = p.to_string_lossy().into_owned();

            // read tags
            let (title, artist, album) = Probe::open(p)
                .and_then(|prb| prb.read())
                .ok()
                .and_then(|tagged| tagged.primary_tag().cloned())
                .map(|tag| {
                    (
                        tag.title().map(String::from),
                        tag.artist().map(String::from),
                        tag.album().map(String::from),
                    )
                })
                .unwrap_or((None, None, None));

            Some(TrackMetadata {
                name,
                path: full_path,
                title,
                artist,
                album,
            })
        })
        .collect()
}
