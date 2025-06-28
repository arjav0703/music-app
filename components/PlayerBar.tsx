import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  track: {
    title?: string;
    name: string;
    artist?: string;
    cover_data_url?: string;
  };
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (val: number) => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlayerBar({
  isPlaying,
  currentTime,
  duration,
  track,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
}: Props) {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 p-4">
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
          <Button
            size="icon"
            variant="ghost"
            onClick={isPlaying ? onPause : onPlay}
          >
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
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.currentTarget.value))}
            className="w-full"
          />
          <div className="text-xs text-right font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </footer>
  );
}
