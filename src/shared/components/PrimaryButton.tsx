import React from "react";
import {
  AccessibilityProps,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { colors, radii, textVariants } from "@/shared/theme";
import { useHaptic } from "@/shared/hooks/useHaptic";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PrimaryButtonVariant = "primary" | "success" | "error" | "ghost";
export type PrimaryButtonSize = "lg" | "md" | "sm";

interface PrimaryButtonProps extends AccessibilityProps {
  label: string;
  onPress: () => void;
  variant?: PrimaryButtonVariant;
  size?: PrimaryButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SHADOW_OFFSET = 4;

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  const haptic = useHaptic();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * SHADOW_OFFSET }],
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value * 0.5,
  }));

  const palette = palettes[variant];
  const dim = sizes[size];

  return (
    <Animated.View
      style={[
        styles.shadowWrap,
        fullWidth && styles.fullWidth,
        style,
        shadowAnimatedStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.shadow,
          { backgroundColor: palette.shadow, borderRadius: dim.radius },
        ]}
      />
      <AnimatedPressable
        onPressIn={() => {
          pressed.value = withTiming(1, {
            duration: 80,
            easing: Easing.out(Easing.quad),
          });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, {
            duration: 120,
            easing: Easing.out(Easing.quad),
          });
        }}
        onPress={() => {
          if (disabled) return;
          haptic("selection");
          onPress();
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        style={[
          styles.button,
          {
            backgroundColor: disabled ? colors.border : palette.fill,
            paddingHorizontal: dim.padX,
            paddingVertical: dim.padY,
            borderRadius: dim.radius,
          },
          animatedStyle,
        ]}
      >
        <Text
          style={[
            textVariants[size === "sm" ? "buttonMd" : "buttonLg"],
            { color: palette.label },
          ]}
        >
          {label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const palettes: Record<
  PrimaryButtonVariant,
  { fill: string; shadow: string; label: string }
> = {
  primary: {
    fill: colors.primary,
    shadow: colors.primaryDark,
    label: colors.textInverse,
  },
  success: {
    fill: colors.success,
    shadow: colors.successDark,
    label: colors.textInverse,
  },
  error: {
    fill: colors.error,
    shadow: colors.errorDark,
    label: colors.textInverse,
  },
  ghost: {
    fill: colors.surface,
    shadow: colors.border,
    label: colors.textPrimary,
  },
};

const sizes: Record<
  PrimaryButtonSize,
  { padX: number; padY: number; radius: number }
> = {
  lg: { padX: 24, padY: 14, radius: radii.lg },
  md: { padX: 20, padY: 12, radius: radii.md },
  sm: { padX: 14, padY: 8, radius: radii.sm },
};

const styles = StyleSheet.create({
  shadowWrap: {
    alignSelf: "flex-start",
    position: "relative",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  shadow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
