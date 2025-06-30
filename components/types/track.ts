export type Track = {
  name: string;
  path: string;
  url?: string;
  title?: string;
  artist?: string;
  album?: string;
  cover_data_url?: string;
};

export type ScannedTrack = {
  name: string;
  path: string;
  title?: string;
  artist?: string;
  album?: string;
  cover_data_url?: string;
};
