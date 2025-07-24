import React, { RefObject, useState, useEffect } from "react";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Shuffle,
  Volume2,
  Volume1,
  VolumeX,
  Volume,
} from "lucide-react";
import { Button } from "@/components/ui/button";
//
type Props = {
  track: {
    cover_data_url?: string;
    title?: string;
    name: string;
    artist?: string;
  };
  isPlaying: boolean;
  onShuffle(): void;
  onPrev(): void;
  onTogglePlay(): void;
  onNext(): void;
  currentTime: number;
  duration: number;
  onSeek(time: number): void;
  audioRef: RefObject<HTMLAudioElement | null>;
  onVolumeUp?(): void;
  onVolumeDown?(): void;
  onToggleMute?(): void;
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

export default function PlayerBar({
  track,
  isPlaying,
  onPrev,
  onTogglePlay,
  onNext,
  currentTime,
  duration,
  onSeek,
  audioRef,
  onShuffle,
}: Props) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  // Update volume state whenever the audio element's volume changesa
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateVolumeState = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    // initial state
    updateVolumeState();

    audio.addEventListener("volumechange", updateVolumeState);

    return () => {
      audio.removeEventListener("volumechange", updateVolumeState);
    };
  }, [audioRef]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      audio.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX />;
    if (volume < 0.3) return <Volume />;
    if (volume < 0.7) return <Volume1 />;
    return <Volume2 />;
  };

  return (
    <footer className="p-4 h-auto border-b border-neutral-800 flex justify-between bg-black/60 backdrop-blur-xl w-5xl rounded-xl self-center fixed bottom-10 z-20">
      <div className="flex items-center justify-between gap-4 mr-5">
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
      </div>

      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={onShuffle}
          disabled={!isPlaying}
        >
          <Shuffle />
        </Button>
        <Button size="icon" variant="ghost" onClick={onPrev}>
          <SkipBack />
        </Button>

        <Button size="icon" variant="ghost" onClick={onTogglePlay}>
          {isPlaying ? <Pause /> : <Play />}
        </Button>

        <Button size="icon" variant="ghost" onClick={onNext}>
          <SkipForward />
        </Button>

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

        {/* <div className="flex items-center gap-2 ml-4">
          <Button size="icon" variant="ghost" onClick={handleToggleMute}>
            {getVolumeIcon()}
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div> */}
      </div>
      <audio ref={audioRef} onEnded={onNext} className="hidden" />
    </footer>
  );
}
