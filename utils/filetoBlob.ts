import { invoke } from "@tauri-apps/api/core";

export async function filePathToBlobUrl(path: string): Promise<string> {
  const bytes = await invoke<unknown>("load_file_bytes", { path });
  if (!Array.isArray(bytes)) {
    throw new Error("Invalid bytes received from backend");
  }

  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const mime = ({
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    m4a: "audio/mp4",
  } as Record<string, string>)[ext] || "application/octet-stream";

  const uint8array = new Uint8Array(bytes);
  const blob = new Blob([uint8array], { type: mime });
  return URL.createObjectURL(blob);
}
