import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MascotView, PrimaryButton, Screen } from "@/shared/components";
import { useVersusStore } from "@/features/versus/store";
import { colors, radii, shadows, spacing, textVariants } from "@/shared/theme";

const MODE_ROUTE = {
  compare: "/(modes)/compare",
  speed: "/(modes)/speed",
  stairs: "/(modes)/stairs",
} as const;

/**
 * Pass-and-play interstitial shown after player 1 finishes a sequential-duel
 * session. Player 2's session (and any real-time timer, e.g. speed) only starts
 * when the "はじめる" button is tapped here.
 */
export default function HandoffScreen() {
  const router = useRouter();
  const mode = useVersusStore((s) => s.mode);
  const p1Score = useVersusStore((s) => s.p1Score);

  const onStart = () => {
    if (mode && mode in MODE_ROUTE) {
      const route = MODE_ROUTE[mode as keyof typeof MODE_ROUTE];
      router.replace({ pathname: route, params: { players: "2" } });
    } else {
      router.replace("/");
    }
  };

  return (
    <Screen padded background={colors.surface}>
      <View style={styles.container}>
        <MascotView state="idle" size={120} />
        <Text style={[textVariants.headingLg, styles.title]}>
          📱 端末を相手に渡してください
        </Text>
        <Text style={[textVariants.bodyMd, styles.subtitle]}>
          プレイヤー1 の番が終わりました。{"\n"}
          プレイヤー2 に交代しましょう。
        </Text>

        {p1Score != null && (
          <View style={styles.scoreCard}>
            <Text style={[textVariants.caption, styles.label]}>
              プレイヤー1 のスコア
            </Text>
            <Text style={[textVariants.displayLg, styles.score]}>
              {p1Score.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="プレイヤー2 ではじめる"
          variant="primary"
          onPress={onStart}
          fullWidth
          accessibilityHint="プレイヤー2 のゲームを開始します"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  scoreCard: {
    width: "100%",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.card,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  label: {
    color: colors.textSecondary,
  },
  score: {
    color: colors.textPrimary,
  },
  actions: {
    paddingBottom: spacing.lg,
  },
});
