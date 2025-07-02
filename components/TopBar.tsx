"use client";
import { FolderOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HeaderProps {
  onScanFolder: () => void;
}

const TopBar: React.FC<HeaderProps> = ({ onScanFolder }) => {
  return (
    <header className="p-4 border-b border-neutral-800 flex justify-between bg-white/30 backdrop-blur-4xl backdrop-brightness-70 w-5xl rounded-xl self-center fixed top-10 z-20">
      <h1 className="text-6xl font-hand mx-4">Musik</h1>
      <div className="flex gap-4">
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
