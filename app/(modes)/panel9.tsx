import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  ConfettiOverlay,
  FeedbackPulse,
  MascotView,
  PrimaryButton,
  Screen,
  ScoreChip,
} from "@/shared/components";
import type { FeedbackKind } from "@/shared/components";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useSfx } from "@/shared/hooks/useSfx";
import { usePanel9Store } from "@/features/panel9/store";
import type { PanelState } from "@/features/panel9/engine";
import { countLines } from "@/features/panel9/engine";
import {
  colors,
  radii,
  shadows,
  spacing,
  textVariants,
} from "@/shared/theme";

export default function Panel9Screen() {
  const router = useRouter();
  const haptic = useHaptic();
  const sfx = useSfx();
  const {
    panels,
    hand,
    round,
    totalRounds,
    turn,
    finished,
    lastResult,
    result,
    start,
    playerPlay,
    cpuPlay,
    reset,
  } = usePanel9Store();
  const [selectedHand, setSelectedHand] = React.useState<string | null>(null);

  React.useEffect(() => {
    start("normal");
    return () => reset();
  }, [start, reset]);

  // Drive CPU turns after each player move.
  React.useEffect(() => {
    if (turn === "cpu" && !finished) {
      const t = setTimeout(() => {
        const r = cpuPlay();
        if (r?.conquered) {
          haptic("warning");
          sfx("panelFlip");
        }
        setSelectedHand(null);
      }, 700);
      return () => clearTimeout(t);
    }
    return;
  }, [turn, finished, cpuPlay, haptic, sfx]);

  React.useEffect(() => {
    if (finished && result) {
      const t = setTimeout(() => {
        router.replace({
          pathname: "/result",
          params: { mode: "panel9", score: String(result.score) },
        });
      }, 1200);
      return () => clearTimeout(t);
    }
    return;
  }, [finished, result, router]);

  const onPanelTap = (panelIndex: number) => {
    if (turn !== "player" || finished) return;
    if (!selectedHand) {
      haptic("warning");
      return;
    }
    const r = playerPlay(panelIndex, selectedHand);
    if (!r) return;
    if (r.conquered) {
      haptic("success");
      sfx("panelFlip");
    } else {
      haptic("error");
    }
    setSelectedHand(null);
  };

  const lines = countLines(panels);

  return (
    <Screen padded>
      <View style={styles.hud}>
        <ScoreChip label="ラウンド" value={`${round + 1} / ${totalRounds}`} />
        <ScoreChip label="自陣" value={lines.playerLines} tone="success" />
        <ScoreChip label="CPU" value={lines.cpuLines} tone="error" />
      </View>

      <Text
        style={[
          textVariants.headingMd,
          styles.turnLabel,
          turn === "cpu" && styles.turnLabelCpu,
        ]}
        accessibilityLiveRegion="polite"
      >
        {turn === "player" ? "あなたのターン" : "思考中…"}
      </Text>

      <View style={styles.boardWrap}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.boardRow}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              const panel = panels[idx];
              const isLast = !!lastResult && lastResult.panelIndex === idx;
              const tileFeedback: FeedbackKind = isLast
                ? lastResult!.conquered
                  ? "correct"
                  : "wrong"
                : null;
              return (
                <FeedbackPulse
                  key={idx}
                  feedback={tileFeedback}
                  triggerKey={`${round}-${idx}-${lastResult?.handWord ?? ""}`}
                  style={styles.tileWrap}
                >
                  <PanelTile
                    panel={panel}
                    onPress={() => onPanelTap(idx)}
                    highlighted={isLast}
                  />
                </FeedbackPulse>
              );
            })}
          </View>
        ))}
      </View>

      <Text
        style={[
          textVariants.bodyMd,
          { color: colors.textSecondary, marginBottom: spacing.sm },
        ]}
      >
        手札を選択 → パネルをタップ
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.handRow}
      >
        {hand.map((word) => (
          <Pressable
            key={word}
            onPress={() => {
              setSelectedHand(word);
              haptic("selection");
            }}
            style={[
              styles.handChip,
              selectedHand === word && styles.handChipSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`手札: ${word}`}
          >
            <Text
              style={[
                textVariants.buttonMd,
                selectedHand === word && { color: colors.textInverse },
              ]}
            >
              {word}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {finished && result && (
        <View style={styles.summary}>
          <MascotView
            state={result.winner === "player" ? "celebrate" : "sad"}
            size={80}
          />
          <Text style={textVariants.headingMd}>
            {result.winner === "player"
              ? "勝利!"
              : result.winner === "tie"
                ? "引き分け"
                : "敗北…"}
          </Text>
          <PrimaryButton
            label="結果へ進む"
            onPress={() =>
              router.replace({
                pathname: "/result",
                params: { mode: "panel9", score: String(result.score) },
              })
            }
          />
        </View>
      )}

      <ConfettiOverlay visible={!!result && result.winner === "player"} />
    </Screen>
  );
}

interface TileProps {
  panel: PanelState | undefined;
  onPress: () => void;
  highlighted: boolean;
}

function PanelTile({ panel, onPress, highlighted }: TileProps) {
  if (!panel) return <View style={styles.tile} />;
  const bg =
    panel.owner === "player"
      ? colors.success
      : panel.owner === "cpu"
        ? colors.error
        : colors.surface;
  const textColor =
    panel.owner === "none" ? colors.textPrimary : colors.textInverse;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        { backgroundColor: bg },
        highlighted && styles.tileHighlighted,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`パネル「${panel.panel_word}」`}
    >
      <Text style={[textVariants.headingSm, { color: textColor }]}>
        {panel.panel_word}
      </Text>
      {panel.lastHitCount != null && (
        <Text
          style={[
            textVariants.caption,
            { color: textColor, opacity: 0.85 },
          ]}
        >
          {panel.lastHitCount.toLocaleString()}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  turnLabel: {
    textAlign: "center",
    marginVertical: spacing.md,
  },
  turnLabelCpu: {
    color: colors.textSecondary,
  },
  boardWrap: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  boardRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tileWrap: {
    flex: 1,
    minWidth: 72,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileHighlighted: {
    borderColor: colors.warning,
    borderWidth: 3,
  },
  handRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  handChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 44,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  handChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  summary: {
    marginTop: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
});
