"use client";

import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";

type Track = {
  name: string;
  url: string;         // e.g. file://… or blob://…
  path?: string;       // real fs path on disk
};

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const pickAndScanFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      // you can also set defaultPath…
    });
    if (typeof selected !== "string") return;

    try {
      // `fn scan_folder(path: String) -> Vec<MyFile>`
      const scanned = await invoke<
        Array<{ name: string; path: string }>
      >("scan_folder", { path: selected });

      const tracks: Track[] = scanned.map((f) => ({
        name: f.name,
        path: f.path,
        url: `file://${f.path}`,
      }));

      setPlaylist(tracks);
      setCurrent(0);
    } catch (err) {
      console.error("scan_folder failed:", err);
    }
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPlaylist((pl) => [...pl, ...newTracks]);
  };

  const play = () => audioRef.current?.play();
  const pause = () => audioRef.current?.pause();
  const next = () =>
    setCurrent((i) => (playlist.length ? (i + 1) % playlist.length : 0));
  const prev = () =>
    setCurrent((i) =>
      playlist.length ? (i - 1 + playlist.length) % playlist.length : 0
    );

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

      <div style={{ marginBottom: 20 }}>
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
