import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  ConfettiOverlay,
  MascotView,
  PrimaryButton,
  Screen,
} from "@/shared/components";
import { useVersusStore } from "@/features/versus/store";
import type { VersusMode } from "@/features/versus/store";
import type { Mode } from "@/data/models";
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

const MODE_ROUTE: Record<Mode, string> = {
  compare: "/(modes)/compare",
  speed: "/(modes)/speed",
  panel9: "/(modes)/panel9",
  stairs: "/(modes)/stairs",
};

const SEQUENTIAL_MODES: readonly Mode[] = ["compare", "speed", "stairs"];

export default function VersusResultScreen() {
  const router = useRouter();
  const mode = useVersusStore((s) => s.mode);
  const p1Score = useVersusStore((s) => s.p1Score);
  const p2Score = useVersusStore((s) => s.p2Score);
  const winner = useVersusStore((s) => s.winner);
  const begin = useVersusStore((s) => s.begin);
  const reset = useVersusStore((s) => s.reset);
  const styles = useStyles();
  const { colors } = useTheme();

  const result = winner();
  const accent = mode ? modeColor(mode) : colors.primary;

  const headline =
    result === "tie"
      ? "引き分け!"
      : result === "p1"
        ? "プレイヤー1 の勝ち!"
        : "プレイヤー2 の勝ち!";

  const onReplay = () => {
    if (!mode) {
      router.replace("/");
      return;
    }
    if (SEQUENTIAL_MODES.includes(mode)) {
      begin(mode as VersusMode);
    } else {
      reset();
    }
    router.replace({
      pathname: MODE_ROUTE[mode],
      params: { players: "2" },
    });
  };

  const onHome = () => {
    reset();
    router.replace("/");
  };

  return (
    <Screen scrollable padded background={colors.surface}>
      <View style={styles.container}>
        <MascotView state={result === "tie" ? "idle" : "celebrate"} size={120} />
        {mode && (
          <Text style={[textVariants.headingMd, styles.modeTitle]}>
            {MODE_TITLES[mode]}
          </Text>
        )}
        <Text style={[textVariants.displayLg, styles.headline]}>{headline}</Text>

        <View style={styles.scoreRow}>
          <PlayerScoreCard
            label="プレイヤー1"
            score={p1Score ?? 0}
            highlight={result === "p1"}
            accent={accent}
          />
          <View style={styles.vs}>
            <Text style={textVariants.headingLg}>VS</Text>
          </View>
          <PlayerScoreCard
            label="プレイヤー2"
            score={p2Score ?? 0}
            highlight={result === "p2"}
            accent={accent}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label="もう一度"
          variant="primary"
          onPress={onReplay}
          fullWidth
        />
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          label="ホームへ"
          variant="ghost"
          onPress={onHome}
          fullWidth
        />
      </View>

      <ConfettiOverlay visible={result !== "tie"} />
    </Screen>
  );
}

interface PlayerScoreCardProps {
  label: string;
  score: number;
  highlight: boolean;
  accent: string;
}

function PlayerScoreCard({
  label,
  score,
  highlight,
  accent,
}: PlayerScoreCardProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.scoreCard,
        { borderTopColor: accent },
        highlight && styles.scoreCardWin,
      ]}
    >
      {highlight && <Text style={styles.crown}>👑</Text>}
      <Text style={[textVariants.caption, styles.label]}>{label}</Text>
      <Text style={[textVariants.headingLg, styles.score]}>
        {score.toLocaleString()}
      </Text>
    </View>
  );
}

const useStyles = makeUseStyles((colors) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  modeTitle: {
    color: colors.textSecondary,
  },
  headline: {
    color: colors.textPrimary,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: "100%",
  },
  vs: {
    paddingHorizontal: spacing.xs,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderTopWidth: 6,
    ...shadows.card,
    gap: spacing.xs,
    minHeight: 120,
    justifyContent: "center",
  },
  scoreCardWin: {
    backgroundColor: "#E8F8DE",
  },
  crown: {
    fontSize: 24,
  },
  label: {
    color: colors.textSecondary,
  },
  score: {
    color: colors.textPrimary,
  },
  actions: {
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
}));
