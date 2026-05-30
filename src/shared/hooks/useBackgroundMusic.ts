import React from "react";
import { Platform } from "react-native";

import { audioService } from "@/core/audio/audioService";
import { usePreferences } from "@/core/storage/preferences";

// Gentle ambient loop. Replace assets/audio/bgm.wav to swap the track.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const BGM_ASSET = require("../../../assets/audio/bgm.wav");

/**
 * Plays the looping background music, driven by the `bgmVolume` preference.
 * Native autoplays on mount; web waits for the first user gesture (browsers
 * block audio autoplay). Volume 0 pauses; raising it resumes.
 */
export function useBackgroundMusic(): void {
  const volume = usePreferences((s) => s.bgmVolume);
  const startedRef = React.useRef(false);

  const start = React.useCallback(() => {
    if (startedRef.current) return;
    const vol = usePreferences.getState().bgmVolume;
    if (vol <= 0) return;
    startedRef.current = true;
    void audioService.playBgm(BGM_ASSET, vol);
  }, []);

  // Warm up the SFX players once so the first cue plays without load latency.
  React.useEffect(() => {
    audioService.preloadSfx();
  }, []);

  // Initial start: native immediately, web on first interaction.
  React.useEffect(() => {
    if (Platform.OS === "web") {
      const onGesture = () => {
        start();
        teardown();
      };
      const teardown = () => {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
      };
      window.addEventListener("pointerdown", onGesture);
      window.addEventListener("keydown", onGesture);
      return teardown;
    }
    start();
    return;
  }, [start]);

  // React to volume changes.
  React.useEffect(() => {
    if (!startedRef.current) {
      if (Platform.OS !== "web" && volume > 0) start();
      return;
    }
    if (volume <= 0) {
      audioService.pauseBgm();
    } else {
      audioService.setBgmVolume(volume);
      audioService.resumeBgm();
    }
  }, [volume, start]);
}
