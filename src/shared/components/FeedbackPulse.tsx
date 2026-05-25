import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, radii } from "@/shared/theme";

export type FeedbackKind = "correct" | "wrong" | null;

interface Props {
  feedback: FeedbackKind;
  /** 同じ feedback 値で再発火させたい場合に変化させるキー */
  triggerKey?: string | number;
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
}

export function FeedbackPulse({
  feedback,
  triggerKey,
  children,
  style,
  borderRadius = radii.lg,
}: Props) {
  const tx = useSharedValue(0);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    if (feedback === "correct") {
      glow.value = withSequence(
        withTiming(1, { duration: 180 }),
        withTiming(0.5, { duration: 220 }),
        withTiming(0, { duration: 480 }),
      );
    } else if (feedback === "wrong") {
      tx.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(-4, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    } else {
      glow.value = withTiming(0, { duration: 100 });
      tx.value = withTiming(0, { duration: 100 });
    }
  }, [feedback, triggerKey, glow, tx]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <Animated.View style={[shakeStyle, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius,
            borderWidth: 4,
            borderColor: colors.success,
            shadowColor: colors.success,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 16,
            elevation: 12,
          },
          glowStyle,
        ]}
      />
      {children}
    </Animated.View>
  );
}
