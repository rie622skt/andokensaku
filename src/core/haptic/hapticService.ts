import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type HapticEvent =
  | "selection"
  | "success"
  | "error"
  | "warning"
  | "lightImpact"
  | "mediumImpact"
  | "heavyImpact";

// Web Vibration API patterns (ms). Works on Android Chrome after a user
// gesture; iOS Safari has no vibration API and silently ignores these.
const WEB_VIBRATION: Record<HapticEvent, number | number[]> = {
  selection: 10,
  success: [12, 40, 24],
  error: [40, 30, 40],
  warning: 25,
  lightImpact: 10,
  mediumImpact: 20,
  heavyImpact: 35,
};

class HapticService {
  async trigger(event: HapticEvent): Promise<void> {
    if (Platform.OS === "web") {
      try {
        if (
          typeof navigator !== "undefined" &&
          typeof navigator.vibrate === "function"
        ) {
          navigator.vibrate(WEB_VIBRATION[event]);
        }
      } catch {
        // best-effort
      }
      return;
    }
    try {
      switch (event) {
        case "selection":
          return Haptics.selectionAsync();
        case "success":
          return Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        case "error":
          return Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
        case "warning":
          return Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
        case "lightImpact":
          return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        case "mediumImpact":
          return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        case "heavyImpact":
          return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch {
      // Haptics is best-effort. Silently swallow.
    }
  }
}

export const hapticService = new HapticService();
