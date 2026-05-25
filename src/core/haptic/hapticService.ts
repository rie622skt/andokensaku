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

class HapticService {
  async trigger(event: HapticEvent): Promise<void> {
    if (Platform.OS === "web") return;
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
