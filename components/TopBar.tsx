"use client";
import { FolderOpen, Settings, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { platform } from "@tauri-apps/plugin-os";

export interface HeaderProps {
  onScanFolder: () => void;
}

const TopBar: React.FC<
  HeaderProps & { searchQuery: string; setSearchQuery: (query: string) => void }
> = ({ onScanFolder, searchQuery, setSearchQuery }) => {
  const [isAndroid, setIsAndroid] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const currentPlatform = await platform();
        setIsAndroid(currentPlatform === "android");
      } catch (error) {
        console.error("Failed to detect platform:", error);
      }
    };
    checkPlatform();
  }, []);

  return (
    <header className="p-2 sm:p-4 h-auto border-b border-neutral-800 flex justify-between bg-black/50 backdrop-blur-xl w-full sm:w-5xl rounded-xl self-center fixed top-2 sm:top-10 z-20">
      <h1 className="text-4xl sm:text-6xl font-hand mx-2 sm:mx-4">Musik</h1>
      <div className="flex gap-2 sm:gap-4 items-center">
        {showSearch ? (
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button onClick={onScanFolder}>
              <FolderOpen className="w-4 h-4" />
            </Button>
            <a href="/settings">
              <Button>
                <Settings className="w-4 h-4" />
              </Button>
            </a>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
