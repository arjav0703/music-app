// TODO: Fix the theme

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  cover?: string;
  title?: string;
  artist?: string;
  onClick: () => void;
};

export default function TrackCard({ cover, title, artist, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer group transition-all duration-200 hover:shadow-lg hover:scale-[1.03] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-neutral-300 text-sm">
            No Cover
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <CardContent className="p-3 text-white">
        <p className="text-base font-semibold truncate">{title}</p>
        <p className="text-sm text-neutral-400 truncate">{artist}</p>
      </CardContent>
    </Card>
  );
}
