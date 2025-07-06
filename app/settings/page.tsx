"use client"

import { FormEvent, useEffect, useState } from "react"
import { ChevronLeft, FolderOpen, Settings } from "lucide-react"
import { Store, load } from "@tauri-apps/plugin-store"
import { Button } from "@/components/ui/button"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import TextScramble from "@/components/Scrambletext"
import { Input } from "@/components/ui/input"
import { invoke } from "@tauri-apps/api/core"
import { info } from "@tauri-apps/plugin-log"
import { message } from '@tauri-apps/plugin-dialog';

export default function SettingsPage() {
  const { pickAndScanFolder } = useAudioPlayer()
  const [defaultDir, setDefaultDir] = useState<string>("")
  const [spotifyUrl, setSpotifyUrl] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle")

  useEffect(() => {
    (async () => {
      const store: Store = await load("settings.json")

      const dir = await store.get("default_dir")
      if (typeof dir === "string") {
        setDefaultDir(dir)
      }

      const savedUrl = await store.get("spotify_url")
      if (typeof savedUrl === "string") {
        setSpotifyUrl(savedUrl)
      }
    })()
  }, [])

  const handleSpotifySubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("saving")

    const store: Store = await load("settings.json")
    await store.set("spotify_url", spotifyUrl)
    await store.save()
    info("Spotify URL saved")

    setStatus("done")
    setTimeout(() => setStatus("idle"), 2000)
  }

  const handleDownloadClick = async () => {
    try {
      await invoke("download_playlist")
      await message('This feature is not fully implemented yet.', { title: 'Musik', kind: 'info' });
      console.log("Download started successfully")
    } catch (error) {
      console.error("Error starting download:", error)
    }
  }

return (
  <div className="bg-black min-h-screen text-white flex mx-50">
    <main className="w-full max-w-3xl">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <a href="/">
          <ChevronLeft className="w-6 h-6 hover:opacity-75 transition" />
        </a>
        <Settings size={40} className="text-white" />
        <h1 className="text-4xl font-extrabold tracking-tight">
          <TextScramble text="Settings" color="#fff" />
        </h1>
      </div>

      <section className="bg-[#1a1a1a] rounded-2xl p-6 shadow-lg space-y-4 border border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-base font-medium flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-neutral-400" />
            <span>Default Folder:</span>
            <span className="text-sm text-neutral-400 truncate max-w-[250px]">
              {defaultDir || "Not set yet"}
            </span>
          </div>

          <Button onClick={pickAndScanFolder} className="ml-auto whitespace-nowrap">
            <FolderOpen className="w-4 h-4 mr-2" />
            Scan Folder
          </Button>
        </div>
      </section>

      <section className="bg-[#1a1a1a] rounded-2xl p-6 shadow-lg space-y-4 border border-neutral-800">
        <h2 className="text-lg font-semibold mb-2">Spotify Playlist URL</h2>
        <form onSubmit={handleSpotifySubmit} className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter your playlist URL"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.currentTarget.value)}
            className="flex-1 bg-neutral-900 border border-neutral-700 text-white"
          />
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save URL"}
          </Button>
        </form>
        {status === "done" && (
          <p className="text-green-400 text-sm">Spotify URL saved!</p>
        )}
      </section>

      <section className="bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border border-neutral-800">
        <Button onClick={handleDownloadClick} className="w-full sm:w-auto">
          Start Download
        </Button>
      </section>
    </main>
  </div>
)
}
