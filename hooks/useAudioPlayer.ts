import { useRef, useState, useEffect, useCallback } from "react";
import { Track, ScannedTrack } from "@/components/types/track";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(1);

  const { persist } = usePlaylistStore();
  const LoadDefaultDir = useCallback(async () => {
    const store: Store = await load("settings.json");
    const dir = await store.get("default_dir");
    if (typeof dir === "string") {
      await scanAndSetPlaylist(dir, 0);
    }
  }, [persist]);

  // Do not touch, auto load on starta
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
    [persist],
  );

  const pickAndScanFolder = useCallback(async () => {
    try {
      const currentPlatform = await platform();
      const isAndroid = currentPlatform == "android";
      // alert(`isAndroid ${isAndroid}`);
      let selected;

      if (isAndroid) {
        // Use Android's content URI approach
        try {
          selected = await invoke<string>("android_pick_folder");
          if (!selected) {
            return;
          }

          // If we get a pending URI, we need to listen for the actual result
          if (selected === "android://pending-folder-selection") {
            // Set up event listener for folder selection result
            const unlisten = await (
              await import("@tauri-apps/api/event")
            ).listen("android-folder-selected", (event) => {
              unlisten();
              if (event.payload) {
                const uri = event.payload as string;
                if (uri && uri !== "android://cancelled") {
                  // Save selected folder to settings
                  (async () => {
                    const store = await import("@tauri-apps/plugin-store");
                    const settingsStore = await store.load("settings.json");
                    await settingsStore.set("default_dir", uri);
                    await settingsStore.save();

                    // Scan the selected folder
                    scanAndSetPlaylist(uri, 0).catch((e) => {
                      warn("Error scanning folder:", e);
                    });
                  })();
                }
              }
            });

            // Return early as we'll handle the result in the event listener
            return;
          }
        } catch (err) {
          info("Error in Android folder selection:");
          return;
        }
      } else {
        selected = await open({ directory: true });
        if (typeof selected !== "string") {
          return;
        }
      }

      const store: Store = await load("settings.json");
      store.set("default_dir", selected);
      await store.save();

      await scanAndSetPlaylist(selected, 0);
    } catch (e) {
      warn("Error picking folder:");
    }
  }, [persist, scanAndSetPlaylist]);

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
    [playlist, persist],
  );

  // controls
  const shuffle = () => {
    if (playlist.length === 0) return;
    const shuffled = [...playlist].sort(() => Math.random() - 0.5);
    setPlaylist(shuffled);
    setCurrent(0);
    setIsPlaying(true);
    persist(shuffled, 0);
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

  const volumeUp = () => {
    if (audioRef.current) {
      const newVolume = Math.min(1, volume + 0.1);
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const volumeDown = () => {
    if (audioRef.current) {
      const newVolume = Math.max(0, volume - 0.1);
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume.current;
        setVolume(previousVolume.current);
      } else {
        previousVolume.current = volume;
        audioRef.current.volume = 0;
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  const setAudioVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      } else if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
      }
    }
  };

  // Effect for loading the current track (only runs when track changes)
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

      // Only set src and load if the URL has changed
      if (audio.src !== url) {
        audio.src = url!;
        audio.load();
      }

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
  }, [current, playlist]);

  // play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => warn("Failed to play audio"));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // volume change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  return {
    playlist,
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
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
    volumeUp,
    volumeDown,
    toggleMute,
    setVolume: setAudioVolume,
  };
}
