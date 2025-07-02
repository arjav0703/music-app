import React, { RefObject } from "react";
import { SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  track: { cover_data_url?: string; title?: string; name: string; artist?: string; };
  isPlaying: boolean;
  onPrev(): void;
  onTogglePlay(): void;
  onNext(): void;
  currentTime: number;
  duration: number;
  onSeek(time: number): void;
  audioRef: RefObject<HTMLAudioElement | null>;
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlayerBar({
  track, isPlaying, onPrev, onTogglePlay, onNext,
  currentTime, duration, onSeek, audioRef
}: Props) {
  return (
    <footer className="p-4 h-auto border-b border-neutral-800 flex justify-between bg-black/60 backdrop-blur-xl w-5xl rounded-xl self-center fixed bottom-10 z-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {track.cover_data_url ? (
            <img
              src={track.cover_data_url}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-neutral-700 rounded-md flex items-center justify-center text-xs">
              No Art
            </div>
          )}
          <div className="truncate">
            <div className="text-sm font-medium truncate">
              {track.title ?? track.name}
            </div>
            <div className="text-xs text-neutral-400 truncate">
              {track.artist ?? "Unknown Artist"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" onClick={onPrev}>
            <SkipBack />
          </Button>

          <Button size="icon" variant="ghost" onClick={onTogglePlay}>
            {isPlaying ? <Pause /> : <Play />}
          </Button>

          <Button size="icon" variant="ghost" onClick={onNext}>
            <SkipForward />
          </Button>
        </div>

        <div className="flex-1 px-4">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.currentTarget.value))}
            className="w-lg mx-auto"
          />
          <div className="text-xs text-right font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
      <audio ref={audioRef} onEnded={onNext} className="hidden" />
    </footer>
  );
}
