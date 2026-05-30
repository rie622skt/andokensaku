import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { formatHitCountJa } from "@/core/utils/formatNumber";
import { textVariants, useTheme } from "@/shared/theme";

interface Props {
  /** The final value the counter should display. */
  value: number;
  /** ms to animate 0 → value. */
  durationMs?: number;
  /**
   * Display style. "ja" collapses big numbers to 万/億 (default, readable at a
   * glance); "thousands" shows comma-separated digits; "raw" shows plain digits.
   */
  format?: "ja" | "thousands" | "raw";
  fontSize?: number;
}

/**
 * Animates a number from 0 to `value`. Used in compare mode to reveal hit
 * counts dramatically.
 */
export function HitCounter({
  value,
  durationMs = 1200,
  format = "ja",
  fontSize = 32,
}: Props) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(value, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, durationMs, progress]);

  useAnimatedReaction(
    () => progress.value,
    (curr) => {
      runOnJS(setDisplay)(Math.round(curr));
    },
  );

  const formatted =
    format === "ja"
      ? formatHitCountJa(display)
      : format === "thousands"
        ? display.toLocaleString("en-US")
        : String(display);

  return (
    <Animated.View>
      <Text
        style={[styles.text, { fontSize, color: colors.textPrimary }]}
        accessibilityLabel={`${formatHitCountJa(value)}件`}
      >
        {formatted}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...textVariants.number,
  },
});
