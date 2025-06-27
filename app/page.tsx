"use client";

import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { readFile } from "@tauri-apps/plugin-fs";
import { SkipBack, SkipForward, Pause, Play, FolderOpen } from "lucide-react";

type Track = {
  name: string;
  url: string;
  path?: string;
  title?: string;
  artist?: string;
  album?: string;
};

type ScannedTrack = {
  name:   string;
  path:   string;
  title?: string;
  artist?: string;
  album?: string;
};

async function filePathToBlobUrl(path: string): Promise<string> {
  const bytes = await readFile(path);
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const mime =
    {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      flac: "audio/flac",
      m4a: "audio/mp4",
    }[ext] || "application/octet-stream";
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  return URL.createObjectURL(blob);
}

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const pickAndScanFolder = async () => {
    const selected = await open({ directory: true });
    if (typeof selected !== "string") return;
    const scanned = await invoke<ScannedTrack[]>(
      "scan_folder",
      { path: selected }
    );

    const tracks: Track[] = await Promise.all(
      scanned.map(async (f) => ({
        name:   f.name,
        path:   f.path,
        url:    await filePathToBlobUrl(f.path),
        title:  f.title,
        artist: f.artist,
        album:  f.album,
      }))
    );


    setPlaylist(tracks);
    setCurrent(0);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = Array.from(files).map((file) => ({
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
    <main className="min-h-screen bg-beige-100 text-teal-900 p-8 font-sans">
      <div className="max-w-xl mx-auto bg-yellow-50 rounded-2xl shadow-xl p-6 space-y-6 border border-yellow-200">
        <h1 className="text-2xl font-bold text-center text-teal-800">
          🎵 Cozy Tauri Music Player
        </h1>

        <div className="flex justify-between gap-2">
          <Button
            onClick={pickAndScanFolder}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <FolderOpen className="mr-2 w-4 h-4" /> Scan Folder
          </Button>

          <label className="flex-1 cursor-pointer bg-yellow-300 hover:bg-yellow-400 text-teal-900 font-medium text-center py-2 px-4 rounded-lg transition duration-150">
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={addFiles}
              className="hidden"
            />
            Add Files
          </label>
        </div>

        {playlist.length > 0 && (
          <div className="space-y-4">
            <div className="bg-yellow-100 rounded-xl p-3 text-center text-lg font-semibold">
              <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {playlist[current].title ?? playlist[current].name}
                  </div>
                  <div className="text-sm text-teal-700 italic">
                    {playlist[current].artist ?? "Unknown"}
                  </div>
                  <div className="text-sm text-teal-700">
                    {playlist[current].album ?? ""}
                  </div>
                </div>
            </div>

            <audio
              ref={audioRef}
              controls
              onEnded={next}
              className="w-full rounded-lg"
            />

            <div className="flex justify-center gap-4 pt-2">
              <Button
                onClick={prev}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                onClick={play}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Play className="w-5 h-5" />
              </Button>
              <Button
                onClick={pause}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Pause className="w-5 h-5" />
              </Button>
              <Button
                onClick={next}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
