import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors, textVariants } from "@/shared/theme";

interface Props {
  /** 履歴がないときの fallback。デフォルトは "/" */
  fallbackHref?: string;
  /** ラベル文言。デフォルト "‹ もどる" */
  label?: string;
}

export function HeaderBackButton({
  fallbackHref = "/",
  label = "‹ もどる",
}: Props) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="戻る"
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(fallbackHref as never);
        }
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      hitSlop={8}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...textVariants.buttonMd,
    color: colors.textInverse,
  },
});
