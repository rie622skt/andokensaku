import { useCallback } from "react";

import { audioService } from "@/core/audio/audioService";
import { SfxName } from "@/core/audio/sfxLibrary";
import { usePreferences } from "@/core/storage/preferences";

export function useSfx(): (name: SfxName) => void {
  const sfxVolume = usePreferences((s) => s.sfxVolume);
  return useCallback(
    (name: SfxName) => {
      if (sfxVolume <= 0) return;
      void audioService.playSfx(name, sfxVolume);
    },
    [sfxVolume],
  );
}
