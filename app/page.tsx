"use client";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrackGrid from "@/components/TrackGrid";
import PlayerBar from "@/components/PlayerBar";
// import { formatTime } from "../utils/formatTime";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import TopBar from "@/components/TopBar";
import { appDataDir } from '@tauri-apps/api/path';
import { invoke } from "@tauri-apps/api/core";

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
    play,
    pause,
    next,
    prev,
    seek,
  } = useAudioPlayer();

  // DO NOT TOUCH!! (used to send data dir to backend)
  useEffect(() => {
    async function fetchAppDataDir() {
      try {
        const path = await appDataDir();
        invoke('catch_data_dir',  {  invokeMessage: path })
      } catch (err: any) {
        console.error('Failed to get appDataDir:', err);
      }
    }

    fetchAppDataDir();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <TopBar onScanFolder={pickAndScanFolder}/>
      <ScrollArea className="flex-1 p-6 pb-24 z-10 mt-40">
        <TrackGrid tracks={playlist} onSelect={playTrack} />
      </ScrollArea>
      {playlist.length > 0 && (
        <PlayerBar
          track={playlist[current]}
          isPlaying={isPlaying}
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
