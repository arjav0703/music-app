import { useState } from "react";
import { Button } from "./ui/button";
import { Keyboard, X } from "lucide-react";

interface ShortcutInfo {
  key: string;
  description: string;
  category: string;
}

export default function KeyboardShoratcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: ShortcutInfo[] = [
    { key: "Space", description: "Play/Pause", category: "Playback" },
    { key: "→", description: "Next track", category: "Playback" },
    { key: "←", description: "Previous track", category: "Playback" },
    { key: "↑", description: "Volume up", category: "Volume" },
    { key: "↓", description: "Volume down", category: "Volume" },
    { key: "Ctrl+M", description: "Mute/Unmute", category: "Volume" },
    { key: "Ctrl+S", description: "Shuffle playlist", category: "Playlist" },
  ];

  const categories = shortcuts.reduce<Record<string, ShortcutInfo[]>>(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {}
  );

  if (!isOpen) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="fixed bottom-4 right-4 opacity-70 hover:opacity-100"
        onClick={() => setIsOpen(true)}
      >
        <Keyboard className="w-4 h-4 mr-2" />
        Keyboard Shortcuts
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h3 className="text-xl font-semibold flex items-center">
            <Keyboard className="mr-2" /> Keyboard Shortcuts
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X />
          </Button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h4 className="text-neutral-400 text-sm font-medium mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex justify-between items-center"
                  >
                    <span>{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 p-4 text-center">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
