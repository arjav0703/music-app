import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";

export async function filePathToBlobUrl(path: string): Promise<string> {
  // Check if this is an Android content URI
  const isAndroid = platform() === "android";
  const isContentUri = path.startsWith("content://");

  if (isAndroid && isContentUri) {
    // Use Android-specific method to get content URI bytes
    const bytes = await invoke<unknown>("load_android_content_uri", {
      uri: path,
    });
    if (!Array.isArray(bytes)) {
      throw new Error("Invalid bytes received from backend");
    }

    // Determine MIME type based on path extension or content type
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      (
        {
          mp3: "audio/mpeg",
          wav: "audio/wav",
          ogg: "audio/ogg",
          flac: "audio/flac",
          m4a: "audio/mp4",
        } as Record<string, string>
      )[ext] || "audio/mpeg"; // Default to audio/mpeg for content URIs

    const uint8array = new Uint8Array(bytes);
    const blob = new Blob([uint8array], { type: mime });
    return URL.createObjectURL(blob);
  } else {
    // Regular file path handling
    const bytes = await invoke<unknown>("load_file_bytes", { path });
    if (!Array.isArray(bytes)) {
      throw new Error("Invalid bytes received from backend");
    }

    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      (
        {
          mp3: "audio/mpeg",
          wav: "audio/wav",
          ogg: "audio/ogg",
          flac: "audio/flac",
          m4a: "audio/mp4",
        } as Record<string, string>
      )[ext] || "application/octet-stream";

    const uint8array = new Uint8Array(bytes);
    const blob = new Blob([uint8array], { type: mime });
    return URL.createObjectURL(blob);
  }
}
