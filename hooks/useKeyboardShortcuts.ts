import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { info, error, trace } from "@tauri-apps/plugin-log";

type ShortcutCallbacks = {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onShuffle?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
};

export function useLocalKeyboardShortcuts({
  onNext,
  onPrev,
  onShuffle,
  onVolumeUp,
  onVolumeDown,
  onMute,
  isPlaying,
  audioRef,
}: ShortcutCallbacks) {
  // Don't need to create a new state since we're using the prop directly
  useEffect(() => {
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> parent of 220f2d2 (WHAT THE ACTUAL FUCK IS HAPPENING)
    trace("Setting up keyboard shortcuts");
=======
    info("Setting up keyboard shortcuts");
>>>>>>> parent of 50e9327 (fix that stupid pause feature)

    const handleKeyDown = (event: KeyboardEvent) => {
      trace(
        `Key pressed: ${event.key}, ctrl: ${event.ctrlKey}, target: ${event.target}`,
      );

      // Ignore key presses if they occur in an input or textareaa
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        trace("Ignoring keypress in input/textarea");
        return;
      }

      try {
        // Check for keydown events
        switch (event.key) {
          case " ":
            event.preventDefault();
            info("Play/pause shortcut triggered");
            try {
              if (isPlaying) {
                audioRef.current?.pause();
                info("Pause action completed");
              } else {
                audioRef.current?.play();
                info("Play action completed");
              }
            } catch (err: any) {
              error(`Error in play/pause: ${err.message}`);
            }
            break;

          case "ArrowRight":
            if (onNext) {
              event.preventDefault();
              info("Next track shortcut triggered");
              try {
                onNext();
                info("Next track action completed");
              } catch (err: any) {
                error(`Error in next track: ${err.message}`);
              }
            } else {
              trace("No next track handler registered");
            }
            break;

          case "ArrowLeft":
            if (onPrev) {
              event.preventDefault();
              info("Previous track shortcut triggered");
              try {
                onPrev();
                info("Previous track action completed");
              } catch (err: any) {
                error(`Error in previous track: ${err.message}`);
              }
            } else {
              trace("No previous track handler registered");
            }
            break;

          case "ArrowUp":
            if (onVolumeUp) {
              event.preventDefault();
              info("Volume up shortcut triggered");
              try {
                onVolumeUp();
                info("Volume up action completed");
              } catch (err: any) {
                error(`Error in volume up: ${err.message}`);
              }
            } else {
              trace("No volume up handler registered");
            }
            break;

          case "ArrowDown":
            if (onVolumeDown) {
              event.preventDefault();
              info("Volume down shortcut triggered");
              try {
                onVolumeDown();
                info("Volume down action completed");
              } catch (err: any) {
                error(`Error in volume down: ${err.message}`);
              }
            } else {
              trace("No volume down handler registered");
            }
            break;

          case "m":
          case "M":
            if (event.ctrlKey && onMute) {
              event.preventDefault();
              info("Mute shortcut triggered");
              try {
                onMute();
                info("Mute action completed");
              } catch (err: any) {
                error(`Error in mute: ${err.message}`);
              }
            } else if (event.ctrlKey) {
              trace("Ctrl+M pressed but no mute handler registered");
            }
            break;

          case "s":
          case "S":
            if (event.ctrlKey && onShuffle) {
              event.preventDefault();
              info("Shuffle shortcut triggered");
              try {
                onShuffle();
                info("Shuffle action completed");
              } catch (err: any) {
                error(`Error in shuffle: ${err.message}`);
              }
            } else if (event.ctrlKey) {
              trace("Ctrl+S pressed but no shuffle handler registered");
            }
            break;

          default:
            // No shortcut
            break;
        }
      } catch (err: any) {
        error(`Keyboard shortcut error: ${err.message}`);
      }
    };

    // add the event listener
    trace("Adding keydown event listener");
    window.addEventListener("keydown", handleKeyDown);

    // cleanup function
    return () => {
      trace("Removing keydown event listener");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onNext,
    onPrev,
    onShuffle,
    onVolumeUp,
    onVolumeDown,
    onMute,
    isPlaying,
    audioRef,
  ]);
}
