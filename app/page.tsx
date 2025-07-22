"use client";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrackGrid from "@/components/TrackGrid";
import PlayerBar from "@/components/PlayerBar";
// import { formatTime } from "../utils/formatTime";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useLocalKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import TopBar from "@/components/TopBar";
import { appDataDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { info, error } from "@tauri-apps/plugin-log";
// 
export default function Home() {
  const {
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
    volumeUp,
    volumeDown,
    toggleMute,
  } = useAudioPlayer();

  // DO NOT TOUCH!! (used to send data dir to backend)
  useEffect(() => {
    async function fetchAppDataDir() {
      try {
        const path = await appDataDir();
        invoke("catch_data_dir", { invokeMessage: path });
      } catch (err: any) {
        console.error("Failed to get appDataDir:", err);
      }
    }

    fetchAppDataDir();
  }, []);

  useEffect(() => {
    async function InvokeNotification() {
      try {
        // let permissionGranted = await isPermissionGranted();
        //
        // if (!permissionGranted) {
        //   const permission = await requestPermission();
        //   permissionGranted = permission === 'granted';
        // }
        // if (permissionGranted) {
        sendNotification({ title: "Tauri", body: "Tauri is awesome!" });
        info("Notification sent successfully");
        // }
      } catch (err: any) {
        error(`Notification error: ${err.message}`);
      }
    }

    InvokeNotification();
  }, []);

  // Register keyboard shortcuts
  useLocalKeyboardShortcuts({
    onPlayPause: isPlaying ? pause : play,
    onNext: next,
    onPrev: prev,
    onShuffle: shuffle,
    onVolumeUp: volumeUp,
    onVolumeDown: volumeDown,
    onMute: toggleMute,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const filteredPlaylist = playlist.filter(
    (track) =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.title &&
        track.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.artist &&
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <TopBar
        onScanFolder={pickAndScanFolder}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <ScrollArea className="flex-1 p-6 pb-24 z-10 mt-40">
        <TrackGrid
          tracks={filteredPlaylist}
          onSelect={(index) => {
            const originalIndex = playlist.findIndex(
              (track) => track === filteredPlaylist[index],
            );
            playTrack(originalIndex);
          }}
        />
      </ScrollArea>
      {playlist.length > 0 && (
        <PlayerBar
          track={playlist[current]}
          isPlaying={isPlaying}
          onShuffle={shuffle}
          onPrev={prev}
          onTogglePlay={isPlaying ? pause : play}
          onNext={next}
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          audioRef={audioRef}
        />
      )}
    </div>
  );
}
