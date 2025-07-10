import { Dispatch, RefObject, SetStateAction } from "react";


const play = (audioRef: RefObject<HTMLAudioElement | null>, setIsPlaying: Dispatch<SetStateAction<boolean>>
) => {
  audioRef.current?.play();
  setIsPlaying(true);
};

// const pause = () => {
//   audioRef.current?.pause();
//   setIsPlaying(false);
// };

// const next = () => {
//   const nextIdx = (current + 1) % playlist.length;
//   setCurrent(nextIdx);
//   setIsPlaying(true);
//   persist(playlist, nextIdx);
// };

// const prev = () => {
//   const prevIdx = (current - 1 + playlist.length) % playlist.length;
//   setCurrent(prevIdx);
//   setIsPlaying(true);
//   persist(playlist, prevIdx);
// };

export default play
