"use client";

import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { readFile } from '@tauri-apps/plugin-fs';

type Track = {
  name: string;
  url: string;   // file://… URI to play
  path?: string; // real FS path
};

async function filePathToBlobUrl(path: string): Promise<string> {
  const bytes = await readFile(path);
  // guess mime type
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const mime = { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac", m4a: "audio/mp4" }[ext] || "application/octet-stream";
  // build a blob and blob‐URL
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  return URL.createObjectURL(blob);
}

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1) Pick a folder via the native dialog, then scan it on the backend
  const pickAndScanFolder = async () => {
    const selected = await open({ directory: true });
    if (typeof selected !== "string") return;
    const scanned = await invoke<Array<{ name: string; path: string }>>("scan_folder", { path: selected });

    // for each file, read it into a blob URL
    const tracks: Track[] = await Promise.all(
      scanned.map(async (f) => ({
        name: f.name,
        path: f.path,
        url: await filePathToBlobUrl(f.path),
      }))
    );

    setPlaylist(tracks);
    setCurrent(0);
  };


  // 2) Add individual files from an <input>
  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPlaylist((pl) => [...pl, ...newTracks]);
  };

  // 3) Playback controls
  const play = () => audioRef.current?.play();
  const pause = () => audioRef.current?.pause();
  const next = () =>
    setCurrent((i) => (playlist.length ? (i + 1) % playlist.length : 0));
  const prev = () =>
    setCurrent((i) =>
      playlist.length ? (i - 1 + playlist.length) % playlist.length : 0
    );

  // whenever current or playlist changes, load & play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;
    audio.pause();
    audio.src = playlist[current].url;
    audio.load();
    audio.play().catch((e) => {
      console.warn("Autoplay prevented:", e);
    });
  }, [current, playlist]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Next.js + Tauri Music Player</h1>

      <div style={{ margin: "20px 0" }}>
        <Button onClick={pickAndScanFolder}>Scan Folder</Button>
      </div>

      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={addFiles}
        style={{ marginBottom: 20 }}
      />

      {playlist.length > 0 && (
        <>
          <div>
            <strong>Now Playing:</strong> {playlist[current].name}
          </div>

          <audio
            ref={audioRef}
            controls
            style={{ width: "100%", marginTop: 10 }}
            onEnded={next}
          />

          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <Button onClick={prev}>Prev</Button>
            <Button onClick={play}>Play</Button>
            <Button onClick={pause}>Pause</Button>
            <Button onClick={next}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
