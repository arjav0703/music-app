"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Track = {
  name: string;
  url: string;
};

export default function Home() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPlaylist((pl) => [...pl, ...files]);
  };

  const play = () => audioRef.current?.play();
  const pause = () => audioRef.current?.pause();
  const next = () => {
    setCurrent((i) => (i + 1) % playlist.length);
  };
  const prev = () => {
    setCurrent((i) => (i - 1 + playlist.length) % playlist.length);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = playlist[current]?.url ?? "";
    audio.load();
    audio.play();
  }, [current, playlist]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Next.js + Tauri Music Player</h1>
      <input type="file" accept="audio/*" multiple onChange={addFiles} />

      {playlist.length > 0 && (
        <>
          <div style={{ marginTop: 20 }}>
            <strong>Now Playing:</strong> {playlist[current].name}
          </div>

          <audio
            ref={audioRef}
            controls
            style={{ width: "100%", marginTop: 10 }}
            onEnded={next}
          />

          <div style={{ marginTop: 10 }}>
            <Button onClick={prev}>Prev</Button>
            <Button onClick={play}>Play</Button>
            <Button onClick={pause}>Pause</Button>
            <Button onClick={next}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
