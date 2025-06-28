"use client";

import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { load, Store } from "@tauri-apps/plugin-store";
import { Button } from "@/components/ui/button";
import {
  SkipBack,
  SkipForward,
  Pause,
  Play,
  FolderOpen,
} from "lucide-react";

type Track = {
  name: string;
  url: string;
  path?: string;
  title?: string;
  artist?: string;
  album?: string;
  cover_data_url?: string;
};

type ScannedTrack = {
  name: string;
  path: string;
  title?: string;
  artist?: string;
  album?: string;
  cover_data_url?: string;
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

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
  const [store, setStore] = useState<Store | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    load("store.json", { autoSave: false }).then(setStore);
  }, []);

  useEffect(() => {
    if (!store) return;
    (async () => {
      const savedList = (await store.get<Track[]>("playlist")) ?? [];
      const savedIdx  = (await store.get<number>("current")) ?? 0;

      if (savedList.length) {
        // Mark the callback `async` and use Promise.all
        const rebuilt = await Promise.all(
          savedList.map(async (t) =>
            t.path
              ? { ...t, url: await filePathToBlobUrl(t.path) }
              : t
          )
        );

        setPlaylist(rebuilt);
        setCurrent(savedIdx);
      }
    })();
  }, [store]);


  const persist = async (plist: Track[], idx: number) => {
    if (!store) return;
    await store.set("playlist", plist);
    await store.set("current", idx);
    await store.save();
  };

  // --- action handlers ---
  const pickAndScanFolder = async () => {
    if (!store) return;
    const selected = await open({ directory: true });
    if (typeof selected !== "string") return;

    const scanned = await invoke<ScannedTrack[]>("scan_folder", {
      path: selected,
    });

    const tracks: Track[] = await Promise.all(
      scanned.map(async (f) => ({
        name: f.name,
        path: f.path,
        url: await filePathToBlobUrl(f.path),
        title: f.title,
        artist: f.artist,
        album: f.album,
        cover_data_url: f.cover_data_url,
      }))
    );

    setPlaylist(tracks);
    setCurrent(0);
    persist(tracks, 0);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    const updated = [...playlist, ...newTracks];
    setPlaylist(updated);
    persist(updated, current);
  };

  const play = () => audioRef.current?.play();
  const pause = () => audioRef.current?.pause();

  const next = () => {
    const nextIdx = playlist.length
      ? (current + 1) % playlist.length
      : 0;
    setCurrent(nextIdx);
    persist(playlist, nextIdx);
  };

  const prev = () => {
    const prevIdx = playlist.length
      ? (current - 1 + playlist.length) % playlist.length
      : 0;
    setCurrent(prevIdx);
    persist(playlist, prevIdx);
  };

  const handleSeek = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  // sync audio element on playlist/current change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playlist.length) return;
    audio.pause();
    audio.src = playlist[current].url;
    audio.load();
    audio.play().catch(() => {});
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [current, playlist]);

  return (
    <main className="min-h-screen flex flex-col bg-beige-100 text-teal-900 font-sans">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-xl mx-auto bg-yellow-50 rounded-2xl shadow-xl p-6 space-y-6 border border-yellow-200">
          <h1 className="text-2xl font-bold text-center text-teal-800">
            🎵 Cozy Tauri Music Player
          </h1>

          <div className="flex justify-between gap-2">
            <Button
              onClick={pickAndScanFolder}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <FolderOpen className="mr-2 w-4 h-4" />
              Scan Folder
            </Button>

            <label className="flex-1 cursor-pointer bg-yellow-300 hover:bg-yellow-400 text-teal-900 font-medium text-center py-2 px-4 rounded-lg">
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
            <div className="bg-yellow-100 rounded-xl p-3 text-center text-lg font-semibold">
              Loaded {playlist.length} tracks
            </div>
          )}
        </div>
      </div>

      {playlist.length > 0 && (
        <footer className="sticky bottom-0 w-full bg-teal-800 text-white border-t border-teal-700 shadow-inner z-10">
          <div className="max-w-xl mx-auto p-4 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              {playlist[current].cover_data_url ? (
                <img
                  src={playlist[current].cover_data_url}
                  alt="Cover"
                  className="w-12 h-12 rounded-md object-cover border border-teal-500"
                />
              ) : (
                <div className="w-12 h-12 bg-teal-600 rounded-md flex items-center justify-center text-xs">
                  No Art
                </div>
              )}
              <div className="truncate">
                <div className="font-semibold text-sm truncate">
                  {playlist[current].title ?? playlist[current].name}
                </div>
                <div className="text-xs text-teal-200 truncate">
                  {playlist[current].artist ?? "Unknown Artist"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button onClick={prev} size="icon" className="bg-transparent">
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button onClick={play} size="icon" className="bg-transparent">
                  <Play className="w-5 h-5 text-white" />
                </Button>
                <Button onClick={pause} size="icon" className="bg-transparent">
                  <Pause className="w-5 h-5 text-white" />
                </Button>
                <Button onClick={next} size="icon" className="bg-transparent">
                  <SkipForward className="w-5 h-5 text-white" />
                </Button>
              </div>
              <div className="text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-teal-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <audio
            ref={audioRef}
            onEnded={next}
            className="hidden"
          />
        </footer>
      )}
    </main>
  );
}
