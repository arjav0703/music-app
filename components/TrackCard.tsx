// TODO: Fix the theme

import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Props = {
  cover?: string;
  title: string;
  artist: string;
  onClick: () => void;
};

export default function TrackCard({ cover, title, artist, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:ring-2 hover:ring-emerald-500 transition"
    >
      <CardHeader className="p-0">
        {cover ? (
          <img
            src={cover}
            alt="Cover"
            className="w-full h-36 object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-36 bg-neutral-700 flex items-center justify-center text-xs">
            No Cover
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 space-y-1">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-neutral-400 truncate">{artist}</p>
      </CardContent>
    </Card>
  );
}
