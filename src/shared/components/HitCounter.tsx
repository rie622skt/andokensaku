import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { colors, textVariants } from "@/shared/theme";

interface Props {
  /** The final value the counter should display. */
  value: number;
  /** ms to animate 0 → value. */
  durationMs?: number;
  /** Whether to show comma separators. */
  formatThousands?: boolean;
  fontSize?: number;
}

/**
 * Animates a number from 0 to `value`. Used in compare mode to reveal hit
 * counts dramatically.
 */
export function HitCounter({
  value,
  durationMs = 1200,
  formatThousands = true,
  fontSize = 32,
}: Props) {
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

  const formatted = formatThousands
    ? display.toLocaleString("en-US")
    : String(display);

  return (
    <Animated.View>
      <Text
        style={[styles.text, { fontSize }]}
        accessibilityLabel={`${value}件`}
      >
        {formatted}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    ...textVariants.number,
    color: colors.textPrimary,
  },
});
