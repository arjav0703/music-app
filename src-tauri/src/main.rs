// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
pub mod android_handler;
pub mod scan;
pub mod spotdl;

#[tokio::main]
async fn main() {
    musik_lib::run();
}
