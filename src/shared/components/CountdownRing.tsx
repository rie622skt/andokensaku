import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { colors, textVariants } from "@/shared/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** Remaining time in seconds (the prop the parent updates each tick). */
  remaining: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function CountdownRing({
  remaining,
  total,
  size = 96,
  strokeWidth = 8,
  color = colors.primary,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(1);

  React.useEffect(() => {
    const ratio = Math.max(0, Math.min(1, remaining / total));
    progress.value = withTiming(ratio, {
      duration: 250,
      easing: Easing.linear,
    });
  }, [remaining, total, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const fillColor =
    remaining <= 3 ? colors.error : remaining <= 7 ? colors.warning : color;

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessibilityRole="timer"
      accessibilityLabel={`残り${Math.ceil(remaining)}秒`}
      accessibilityLiveRegion="polite"
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[textVariants.headingLg, { color: fillColor }]}>
          {Math.ceil(remaining)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
