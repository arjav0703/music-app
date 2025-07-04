"use client"

import { FormEvent, useEffect, useState } from "react"
import { FolderOpen, Settings } from "lucide-react"
import { Store, load } from "@tauri-apps/plugin-store"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import TextScramble from "@/components/Scrambletext"
import { Input } from "@/components/ui/input"
import { invoke } from "@tauri-apps/api/core"
import { info } from "@tauri-apps/plugin-log"

export default function SettingsPage() {
  const { pickAndScanFolder } = useAudioPlayer();
  const [defaultDir, setDefaultDir] = useState<string>("");
  const [spotifyUrl, setSpotifyUrl] = useState<string>("");

  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    (async () => {
      const store: Store = await load("settings.json");

      const dir = await store.get("default_dir");
      if (typeof dir === "string") {
        setDefaultDir(dir);
      }

      const savedUrl = await store.get("spotify_url");
      if (typeof savedUrl === "string") {
        setSpotifyUrl(savedUrl);
      }
    })();
  }, []);

  const handleSpotifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("saving");

    const store: Store = await load("settings.json");
    await store.set("spotify_url", spotifyUrl);
    await store.save();
    info("Spotify URL saved")

    setStatus("done");
    
    setTimeout(() => setStatus("idle"), 2000);
  };

  const handleDownloadClick = async () => {
    try {
      await invoke("download_playlist");
      console.log("Download started successfully");
    } catch (error) {
      console.error("Error starting download:", error);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <main className="max-w-5xl mx-auto py-10">
        <h1 className="text-6xl flex font-bold">
          <Settings size={60} />
          <TextScramble text="Settings" color="#fff" />
        </h1>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-2xl flex align-text-bottom justify-between">
              <div className="flex items-center">
                <FolderOpen className="mx-1" />
                Default folder:
                <p className="mx-1 hover:underline">
                  {defaultDir || "Not set yet"}
                </p>
              </div>

              <Button onClick={pickAndScanFolder}>
                <FolderOpen className="w-4 h-4 mr-2" /> Scan Folder
              </Button>
            </h2>
          </section>

          <section>
            <h2 className="text-2xl mb-4">Spotify URL</h2>
            <form onSubmit={handleSpotifySubmit} className="flex space-x-2">
              <Input
                type="text"
                placeholder="your playlist's url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.currentTarget.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={status === "saving"}>
                {status === "saving" ? "Saving…" : "Save URL"}
              </Button>
            </form>
            {status === "done" && (
              <p className="mt-2 text-green-400">Saved!</p>
            )}
          </section>

          <section>
            <Button onClick={handleDownloadClick} className="mt-4">
              Start Download
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
