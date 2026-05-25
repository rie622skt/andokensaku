import React from "react";
import { StyleSheet, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import { colors } from "@/shared/theme";

interface Props {
  /** When true, fire confetti. Reset by parent. */
  visible: boolean;
  onComplete?: () => void;
}

export function ConfettiOverlay({ visible, onComplete }: Props) {
  if (!visible) return null;
  return (
    <View
      pointerEvents="none"
      style={styles.wrap}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <ConfettiCannon
        count={120}
        origin={{ x: -10, y: 0 }}
        autoStart
        fadeOut
        explosionSpeed={350}
        fallSpeed={2500}
        colors={[
          colors.primary,
          colors.success,
          colors.warning,
          colors.modeCompare,
          colors.modeSpeed,
        ]}
        onAnimationEnd={onComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
});
