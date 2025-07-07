"use client";
import { FolderOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface HeaderProps {
  onScanFolder: () => void;
}

const TopBar: React.FC<
  HeaderProps & { searchQuery: string; setSearchQuery: (query: string) => void }
> = ({ onScanFolder, searchQuery, setSearchQuery }) => {
  return (
    <header className="p-4 h-auto border-b border-neutral-800 flex justify-between bg-black/50 backdrop-blur-xl w-5xl rounded-xl self-center fixed top-10 z-20">
      <h1 className="text-6xl font-hand mx-4">Musik</h1>
      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Button onClick={onScanFolder}>
          <FolderOpen className="w-4 h-4" />
        </Button>
        <a href="/settings">
          <Button>
            <Settings className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </header>
  );
};

export default TopBar;
