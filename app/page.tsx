"use client";
import React from "react";
import {
  FolderOpen,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Settings,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrackGrid from "@/components/TrackGrid";
import PlayerBar from "@/components/PlayerBar";
// import { formatTime } from "../utils/formatTime";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

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

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="p-4 border-b border-neutral-800 flex justify-between">
        <h1 className="text-6xl font-hand mx-4"> Musik </h1>
        <div className="flex gap-4">
          <Button onClick={pickAndScanFolder}>
            <FolderOpen className="w-4 h-4 mr-2" /> Scan Folder
          </Button>
          <a href="/settings">
            <Button>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
          </a>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6 pb-24">
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
