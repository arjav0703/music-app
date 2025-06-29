"use client";
//    
import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { load, Store } from "@tauri-apps/plugin-store";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  FolderOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrackGrid from "@/components/TrackGrid";
import PlayerBar from "@/components/PlayerBar";
import { useCallback } from "react";


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
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    load("store.json", { autoSave: false }).then(setStore);
  }, []);

  useEffect(() => {
    if (!store) return;
    (async () => {
      const savedList = (await store.get<Track[]>("playlist")) ?? [];
      const savedIdx = (await store.get<number>("current")) ?? 0;

      if (savedList.length) {
        const rebuilt = await Promise.all(
          savedList.map(async (t) =>
            t.path ? { ...t, url: await filePathToBlobUrl(t.path) } : t
          )
        );

        setPlaylist(rebuilt);
        setCurrent(savedIdx);
      }
    })();
  }, [store]);

  const persist = useCallback(
      async (plist: Track[], idx: number) => {
        if (!store) return;
        await store.set("playlist", plist);
        await store.set("current", idx);
        await store.save();
      },
      [store]
    );

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

  const playTrack = (index: number) => {
    setCurrent(index);
    setIsPlaying(true);
    persist(playlist, index);
  };

  const play = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const next = () => {
    const nextIdx = (current + 1) % playlist.length;
    setCurrent(nextIdx);
    setIsPlaying(true);
    persist(playlist, nextIdx);
  };

  const prev = () => {
    const prevIdx = (current - 1 + playlist.length) % playlist.length;
    setCurrent(prevIdx);
    setIsPlaying(true);
    persist(playlist, prevIdx);
  };

  const handleSeek = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playlist.length) return;
    audio.src = playlist[current].url;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [current, playlist, isPlaying]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="p-4 border-b border-neutral-800 flex justify-between">
        <h1 className="text-2xl font-bold">🎶 TauriTunes</h1>
        <Button onClick={pickAndScanFolder}>
          <FolderOpen className="w-4 h-4 mr-2" />
          Scan Folder
        </Button>
      </header>

      <ScrollArea className="flex-1 p-6 pb-24">
        <TrackGrid tracks={playlist} onSelect={playTrack} />
      </ScrollArea>

      {playlist.length > 0 && (
        <footer className="bg-neutral-900 border-t border-neutral-800 p-4 fixed bottom-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {playlist[current].cover_data_url ? (
                <img
                  src={playlist[current].cover_data_url}
                  className="w-12 h-12 rounded-md object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-neutral-700 rounded-md flex items-center justify-center text-xs">
                  No Art
                </div>
              )}
              <div className="truncate">
                <div className="text-sm font-medium truncate">
                  {playlist[current].title ?? playlist[current].name}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {playlist[current].artist ?? "Unknown Artist"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" onClick={prev}>
                <SkipBack />
              </Button>
              <Button size="icon" variant="ghost" onClick={isPlaying ? pause : play}>
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button size="icon" variant="ghost" onClick={next}>
                <SkipForward />
              </Button>
            </div>

            <div className="flex-1 px-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="text-xs text-right font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
          <audio ref={audioRef} onEnded={next} className="hidden" />
        </footer>
      )}
    </div>
  );
}
