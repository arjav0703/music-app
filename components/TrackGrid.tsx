import TrackCard from "./TrackCard";

type Track = {
  name: string;
  title?: string;
  artist?: string;
  cover_data_url?: string;
};

type Props = {
  tracks: Track[];
  onSelect: (index: number) => void;
};

export default function TrackGrid({ tracks, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
      {tracks.map((track, index) => (
        <TrackCard
          key={index}
          title={track.title ?? track.name}
          artist={track.artist ?? "Unknown Artist"}
          cover={track.cover_data_url}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
