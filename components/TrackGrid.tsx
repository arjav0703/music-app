import TrackCard from "./TrackCard";
import { InView } from "react-intersection-observer";

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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {tracks.map((track, index) => (
        <InView
          key={index}
          triggerOnce
          rootMargin="500px"
        >
          {({ inView, ref }) => (
            <div ref={ref}>
              {inView ? (
                <TrackCard
                  title={track.title ?? track.name}
                  artist={track.artist ?? "Unknown Artist"}
                  cover={track.cover_data_url}
                  onClick={() => onSelect(index)}
                />
              ) : (
                <div
                  className="w-full bg-gray-100 animate-pulse"
                  style={{ aspectRatio: "1 / 1" }}
                />
              )}
            </div>
          )}
        </InView>
      ))}
    </div>
  );
}
