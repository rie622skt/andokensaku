import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, textVariants } from "@/shared/theme";

export type MascotState = "idle" | "celebrate" | "sad" | "thinking";

interface Props {
  state?: MascotState;
  size?: number;
  style?: ViewStyle;
}

// Placeholder mascot using an emoji + Reanimated bounce. The real
// implementation uses rive-react-native against assets/rive/mascot.riv.
// Swap when the Rive asset lands.
export function MascotView({ state = "idle", size = 96, style }: Props) {
  const offset = useSharedValue(0);

  React.useEffect(() => {
    const distance = state === "celebrate" ? 12 : state === "sad" ? -4 : 6;
    const duration = state === "celebrate" ? 320 : 600;
    offset.value = withRepeat(
      withSequence(
        withTiming(-distance, {
          duration,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, {
          duration,
          easing: Easing.in(Easing.cubic),
        }),
      ),
      -1,
      true,
    );
  }, [state, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle,
        style,
      ]}
      accessibilityLabel={labelFor(state)}
      accessibilityHint={hintFor(state)}
      accessibilityRole="image"
    >
      <View
        style={[
          styles.face,
          { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 },
        ]}
      >
        <Text style={[textVariants.displayMd, { fontSize: size * 0.42 }]}>
          {faceFor(state)}
        </Text>
      </View>
    </Animated.View>
  );
}

function faceFor(state: MascotState): string {
  switch (state) {
    case "celebrate":
      return "🎉";
    case "sad":
      return "😢";
    case "thinking":
      return "🤔";
    case "idle":
    default:
      return "🔍";
  }
}

function labelFor(state: MascotState): string {
  switch (state) {
    case "celebrate":
      return "喜ぶマスコット";
    case "sad":
      return "悲しむマスコット";
    case "thinking":
      return "考えるマスコット";
    case "idle":
    default:
      return "マスコット";
  }
}

function hintFor(state: MascotState): string | undefined {
  switch (state) {
    case "celebrate":
      return "正解を喜んでいます";
    case "sad":
      return "不正解を残念がっています";
    case "thinking":
      return "問題を準備しています";
    case "idle":
    default:
      return undefined;
  }
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  face: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
