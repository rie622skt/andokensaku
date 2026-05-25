import { useCallback } from "react";

import {
  HapticEvent,
  hapticService,
} from "@/core/haptic/hapticService";
import { usePreferences } from "@/core/storage/preferences";

export function useHaptic(): (event: HapticEvent) => void {
  const enabled = usePreferences((s) => s.hapticEnabled);
  return useCallback(
    (event: HapticEvent) => {
      if (!enabled) return;
      void hapticService.trigger(event);
    },
    [enabled],
  );
}
