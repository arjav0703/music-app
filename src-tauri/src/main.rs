// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
pub mod scan;
pub mod spotdl;

fn main() {
    spotdl::init_download();
    musik_lib::run()
}
