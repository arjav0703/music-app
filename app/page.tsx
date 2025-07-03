"use client";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrackGrid from "@/components/TrackGrid";
import PlayerBar from "@/components/PlayerBar";
// import { formatTime } from "../utils/formatTime";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import TopBar from "@/components/TopBar";
import { appDataDir } from '@tauri-apps/api/path';

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

  const [appDataDirPath, setAppDataDirPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppDataDir() {
      try {
        const path = await appDataDir();
        setAppDataDirPath(path);
      } catch (err: any) {
        console.error('Failed to get appDataDir:', err);
        setError(err?.message ?? 'Unknown error');
      }
    }

    fetchAppDataDir();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <TopBar onScanFolder={pickAndScanFolder}/>
      {appDataDirPath}
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
