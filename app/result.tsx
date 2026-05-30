import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  ConfettiOverlay,
  MascotView,
  PrimaryButton,
  Screen,
} from "@/shared/components";
import { progressRepository } from "@/data/repositories/progressRepository";
import type { Mode } from "@/data/models";
import { useSfx } from "@/shared/hooks/useSfx";
import {
  makeUseStyles,
  modeColor,
  radii,
  shadows,
  spacing,
  textVariants,
  useTheme,
} from "@/shared/theme";

const MODE_TITLES: Record<Mode, string> = {
  compare: "どちらが多い?",
  speed: "早打ちケンサク銃士",
  panel9: "ケンサク!パネル9",
  stairs: "のぼるケンサク階段",
};

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: Mode; score?: string }>();
  const mode = (params.mode ?? "compare") as Mode;
  const score = Number(params.score ?? "0");

  const progress = React.useMemo(() => progressRepository.get(mode), [mode]);
  const isNewBest = score >= progress.bestScore && score > 0;
  const styles = useStyles();
  const { colors } = useTheme();
  const sfx = useSfx();

  React.useEffect(() => {
    sfx(isNewBest ? "clearJingle" : "correct");
    // Play once on result mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen padded background={colors.surface}>
      <View style={styles.container}>
        <MascotView state={isNewBest ? "celebrate" : "idle"} size={140} />
        <Text style={[textVariants.headingMd, styles.modeTitle]}>
          {MODE_TITLES[mode]}
        </Text>
        <View style={[styles.scoreCard, { borderTopColor: modeColor(mode) }]}>
          <Text style={[textVariants.caption, styles.label]}>あなたのスコア</Text>
          <Text style={[textVariants.displayLg, styles.score]}>
            {score.toLocaleString()}
          </Text>
          <Text style={[textVariants.bodySm, styles.label]}>
            ベスト {progress.bestScore.toLocaleString()}
          </Text>
          {isNewBest && (
            <Text style={[textVariants.headingMd, styles.newBest]}>
              ✨ ハイスコア更新!
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="もう一度"
          variant="primary"
          onPress={() => router.replace(`/(modes)/${mode}`)}
          fullWidth
        />
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          label="ホームへ"
          variant="ghost"
          onPress={() => router.replace("/")}
          fullWidth
        />
      </View>

      <ConfettiOverlay visible={isNewBest} />
    </Screen>
  );
}

const useStyles = makeUseStyles((colors) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  modeTitle: {
    color: colors.textSecondary,
  },
  scoreCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    borderTopWidth: 6,
    ...shadows.card,
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
  },
  score: {
    color: colors.textPrimary,
  },
  newBest: {
    color: colors.warning,
    marginTop: spacing.md,
  },
  actions: {
    paddingBottom: spacing.lg,
  },
}));
