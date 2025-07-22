import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { info, error } from "@tauri-apps/plugin-log";

type ShortcutCallbacks = {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onShuffle?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
}; 

export function useKeyboardShortcuts({
  onPlayPause,
  onNext,
  onPrev,
  onShuffle,
  onVolumeUp,
  onVolumeDown,
  onMute,
}: ShortcutCallbacks) {
  useEffect(() => {
    const registerShortcuts = async () => {
      try {
        // media control shortcuts
        if (onPlayPause) {
          await register("Space", () => {
            info("Play/Pause shortcut triggered");
            onPlayPause();
          });

          // Register media keys if available
          await register("MediaPlayPause", () => {
            info("Media Play/Pause key triggered");
            onPlayPause();
          });
        }

        if (onNext) {
          await register("ArrowRight", () => {
            info("Next track shortcut triggered");
            onNext();
          });

          // Register media keys if available
          await register("MediaTrackNext", () => {
            info("Media Next key triggered");
            onNext();
          });
        }

        if (onPrev) {
          await register("ArrowLeft", () => {
            info("Previous track shortcut triggered");
            onPrev();
          });

          // Register media keys if available
          await register("MediaTrackPrevious", () => {
            info("Media Previous key triggered");
            onPrev();
          });
        }

        if (onShuffle) {
          await register("CommandOrControl+S", () => {
            info("Shuffle shortcut triggered");
            onShuffle();
          });
        }

        // volume control
        if (onVolumeUp) {
          await register("ArrowUp", () => {
            info("Volume up shortcut triggered");
            onVolumeUp();
          });
        }

        if (onVolumeDown) {
          await register("ArrowDown", () => {
            info("Volume down shortcut triggered");
            onVolumeDown();
          });
        }

        if (onMute) {
          await register("CommandOrControl+M", () => {
            info("Mute shortcut triggered");
            onMute();
          });
        }

        info("Keyboard shortcuts registered successfully");
      } catch (err: any) {
        error(`Failed to register keyboard shortcuts: ${err.message}`);
        console.error("Error registering keyboard shortcuts:", err);
      }
    };

    registerShortcuts();

    // cleanup function to unregister all shortcuts when component unmounts
    return () => {
      const cleanupShortcuts = async () => {
        try {
          if (onPlayPause) {
            await unregister("Space");
            await unregister("MediaPlayPause");
          }
          if (onNext) {
            await unregister("ArrowRight");
            await unregister("MediaTrackNext");
          }
          if (onPrev) {
            await unregister("ArrowLeft");
            await unregister("MediaTrackPrevious");
          }
          if (onShuffle) {
            await unregister("CommandOrControl+S");
          }
          if (onVolumeUp) {
            await unregister("ArrowUp");
          }
          if (onVolumeDown) {
            await unregister("ArrowDown");
          }
          if (onMute) {
            await unregister("CommandOrControl+M");
          }

          info("Keyboard shortcuts unregistered successfully");
        } catch (err: any) {
          error(`Failed to unregister keyboard shortcuts: ${err.message}`);
          console.error("Error unregistering keyboard shortcuts:", err);
        }
      };

      cleanupShortcuts();
    };
  }, [onPlayPause, onNext, onPrev, onShuffle, onVolumeUp, onVolumeDown, onMute]);
}
