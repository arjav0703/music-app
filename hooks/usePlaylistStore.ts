import { useState, useEffect, useCallback } from "react";
import { Store, load } from "@tauri-apps/plugin-store";
import { Track } from "@/components/types/track";
import { info, error } from "@tauri-apps/plugin-log";

export function usePlaylistStore() {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    load("store.json", { autoSave: false })
      .then((s) => {
        setStore(s);
        info("Loaded store.json");
      })
      .catch((e) => {
        error("Failed to load store.json:", e);
      });
  }, []);

  const persist = useCallback(
    async (playlist: Track[], current: number) => {
      if (!store) return;
      await store.set("playlist", playlist);
      await store.set("current", current);
      await store.save();
    },
    [store]
  );

  return { store, persist };
}
