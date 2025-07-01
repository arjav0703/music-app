"use client"

import { useEffect, useState } from "react"
import { FolderOpen, Settings } from "lucide-react"
import { Store, load } from "@tauri-apps/plugin-store"

export default function SettingsPage() {
  const [defaultDir, setDefaultDir] = useState<string>("")

  useEffect(() => {
    ;(async () => {
      const store: Store = await load("settings.json")
      const dir = await store.get("default_dir")
      if (typeof dir === "string") {  
        setDefaultDir(dir)
      }
    })()
  }, [])

  return (
    <div className="bg-black min-h-screen text-white">
      <main className="max-w-5xl mx-auto py-10">
        <h1 className="text-6xl flex font-bold">
          <Settings size={60} /> Settings
        </h1>
        <div className="mt-10">
          <h2 className="text-2xl flex align-text-bottom">
            <FolderOpen className="mx-1"/> Default folder:
            <p className="mx-1">
                {defaultDir || "Not set yet"}
            </p>
          </h2>

        </div>
      </main>
    </div>
  )
}
