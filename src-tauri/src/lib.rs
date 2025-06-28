// // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod scan;
use scan::scan_folder;
//use serde_json::json;
//use tauri::Wry;
//use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        //.invoke_handler(tauri::generate_handler![my_custom_command])
        .invoke_handler(tauri::generate_handler![scan_folder])
        //.setup(|app| {
        //    // this also put the store in the app's resource table
        //    // so your following calls `store` calls (from both rust and js)
        //    // will reuse the same store
        //    let store = app.store("playlist.json")?;
        //
        //    // otherwise, they will not be compatible with the JavaScript bindings.
        //    store.set("some-key", json!({ "value": 5 }));
        //
        //    // Get a value from the store.
        //    let value = store
        //        .get("some-key")
        //        .expect("Failed to get value from store");
        //    println!("{}", value); // {"value":5}
        //
        //    // Remove the store from the resource table
        //    //store.close_resource();
        //
        //    Ok(())
        //})
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
