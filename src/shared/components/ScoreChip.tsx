import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, radii, spacing, textVariants } from "@/shared/theme";

interface Props {
  label: string;
  value: number | string;
  tone?: "neutral" | "success" | "warning" | "error";
  style?: ViewStyle;
}

const tonePalette: Record<NonNullable<Props["tone"]>, string> = {
  neutral: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

export function ScoreChip({ label, value, tone = "neutral", style }: Props) {
  return (
    <View
      style={[styles.chip, { backgroundColor: tonePalette[tone] }, style]}
      accessibilityRole="text"
      accessibilityLabel={`${label} ${value}`}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    gap: spacing.sm,
  },
  label: {
    ...textVariants.caption,
    color: colors.textInverse,
    opacity: 0.8,
  },
  value: {
    ...textVariants.buttonMd,
    color: colors.textInverse,
  },
});
