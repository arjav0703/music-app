// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }
mod scan;
use scan::scan_folder;

#[tauri::command]
fn my_custom_command(invoke_message: String) -> String {
    println!(
        "I was invoked from JavaScript with message: {}",
        invoke_message
    );
    format!("Received message: {}", invoke_message)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        //.invoke_handler(tauri::generate_handler![my_custom_command])
        .invoke_handler(tauri::generate_handler![scan_folder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
