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
      className="cursor-pointer hover:ring-2 hover:scale-101 transition bg-transparent"
    >
      <CardHeader className="p-0 m-0">
        {cover ? (
          <img
            src={cover}
            alt="Cover"
            className="w-full h-auto object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-auto bg-neutral-700 flex items-center justify-center text-xs">
            No Cover
          </div>
        )}
      </CardHeader>
      <CardContent className="text-white">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-neutral-400 truncate">{artist}</p>
      </CardContent>
    </Card>
  );
}
