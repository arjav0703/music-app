import { useRef, useState, useEffect, useCallback } from "react";
import { Track, ScannedTrack } from "@/components/types/track";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { filePathToBlobUrl } from "@/utils/filetoBlob";
import { usePlaylistStore } from "./usePlaylistStore";
import { error, info, warn } from "@tauri-apps/plugin-log";
import { Store, load } from "@tauri-apps/plugin-store";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { persist } = usePlaylistStore();

  const LoadDefaultDir = useCallback(async () => {
    const store: Store = await load("settings.json");
    const dir = await store.get("default_dir");
    if (typeof dir === "string") {
      await scanAndSetPlaylist(dir, 0);
    }
  }, [persist])

  // Do not touch, auto load on start
  useEffect(() => {
    LoadDefaultDir();
  }, [LoadDefaultDir]);


  const scanAndSetPlaylist = useCallback(
    async (path: string, startIndex: number) => {
      const scanned = await invoke<ScannedTrack[]>("scan_folder", { path });
      const tracks: Track[] = scanned.map((f) => ({
        name: f.name,
        path: f.path,
        title: f.title,
        artist: f.artist,
        album: f.album,
        cover_data_url: f.cover_data_url,
      }));

      setPlaylist(tracks);
      setCurrent(startIndex);
      persist(tracks, startIndex);
    },
    [persist]
  );

  const pickAndScanFolder = useCallback(async () => {
    try {
      const selected = await open({ directory: true });
      if (typeof selected !== "string") {
        return;
      }

      const store: Store = await load("settings.json");
      store.set("default_dir", selected);
      await store.save();

      await scanAndSetPlaylist(selected, 0);
    } catch (e) {
    }
  }, [persist]);

  // play a specific track (loads URL if needed)
  const playTrack = useCallback(
    async (index: number) => {
      const t = playlist[index];
      if (!t.url && t.path) {
        const url = await filePathToBlobUrl(t.path);
        const copy = [...playlist];
        copy[index] = { ...t, url };
        setPlaylist(copy);
      }
      setCurrent(index);
      setIsPlaying(true);
      persist(playlist, index);
    },
    [playlist, persist]
  );

  // controls
  const shuffle = () => {
    if (playlist.length === 0) return;
    const shuffled = [...playlist].sort(() => Math.random() - 0.5);
    setPlaylist(shuffled);
    setCurrent(0);
    setIsPlaying(true);
    persist(shuffled, 0);
  }

  const play = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };
  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };
  const next = () => {
    if (playlist.length === 0) return;
    const idx = (current + 1) % playlist.length;
    setCurrent(idx);
    setIsPlaying(true);
    persist(playlist, idx);
  };
  const prev = () => {
    if (playlist.length === 0) return;
    const idx = (current - 1 + playlist.length) % playlist.length;
    setCurrent(idx);
    setIsPlaying(true);
    persist(playlist, idx);
  };
  const seek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // sync audio element when track/current/playing changes
  useEffect(() => {
    const audio = audioRef.current;
    const t = playlist[current];
    if (!audio || !t) return;

    const setup = async () => {
      let url = t.url;
      if (!url && t.path) {
        url = await filePathToBlobUrl(t.path);
        const copy = [...playlist];
        copy[current] = { ...t, url };
        setPlaylist(copy);
      }
      audio.src = url!;
      audio.load();
      if (isPlaying) {
        try {
          await audio.play();
        } catch {
          warn("Failed to auto-play");
        }
      }
    };
    setup();

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [current, playlist, isPlaying]);

  return {
    playlist,
    current,
    isPlaying,
    currentTime,
    duration,
    audioRef,
    pickAndScanFolder,
    LoadDefaultDir,
    playTrack,
    shuffle,
    play,
    pause,
    next,
    prev,
    seek,
  };
}

