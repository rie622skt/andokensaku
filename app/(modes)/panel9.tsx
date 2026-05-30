import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useVersusStore } from "@/features/versus/store";
import { formatHitCountJa } from "@/core/utils/formatNumber";
import type { PanelState, FinalScore } from "@/features/panel9/engine";
import { countLines } from "@/features/panel9/engine";
import {
  makeUseStyles,
  radii,
  shadows,
  spacing,
  textVariants,
  useTheme,
} from "@/shared/theme";

/** Per-player score derived from a FinalScore: lines dominate, then tiles. */
function sideScore(lines: number, tiles: number): number {
  return lines * 1000 + tiles * 80;
}

export default function Panel9Screen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const haptic = useHaptic();
  const sfx = useSfx();
  const params = useLocalSearchParams<{ players?: string }>();
  const isVersus = params.players === "2";
  const setVersusScores = useVersusStore((s) => s.setScores);
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
    p2Play,
    cpuPlay,
    reset,
  } = usePanel9Store();
  const [selectedHand, setSelectedHand] = React.useState<string | null>(null);
  const navigatedRef = React.useRef(false);

  React.useEffect(() => {
    start("normal", undefined, isVersus);
    return () => reset();
  }, [start, reset, isVersus]);

  // Drive CPU turns after each player move (solo only — in 2P, player 2 plays).
  React.useEffect(() => {
    if (!isVersus && turn === "cpu" && !finished) {
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
  }, [isVersus, turn, finished, cpuPlay, haptic, sfx]);

  const goToResult = React.useCallback(
    (fs: FinalScore) => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      if (isVersus) {
        setVersusScores(
          "panel9",
          sideScore(fs.playerLines, fs.playerTiles),
          sideScore(fs.cpuLines, fs.cpuTiles),
        );
        router.replace("/versus/result");
      } else {
        router.replace({
          pathname: "/result",
          params: { mode: "panel9", score: String(fs.score) },
        });
      }
    },
    [isVersus, setVersusScores, router],
  );

  React.useEffect(() => {
    if (finished && result) {
      const t = setTimeout(() => goToResult(result), 1200);
      return () => clearTimeout(t);
    }
    return;
  }, [finished, result, goToResult]);

  const onPanelTap = (panelIndex: number) => {
    if (finished) return;
    if (!selectedHand) {
      haptic("warning");
      return;
    }
    // P1 plays on the "player" turn; in 2P, P2 plays on the "cpu" turn.
    const r =
      turn === "player"
        ? playerPlay(panelIndex, selectedHand)
        : isVersus
          ? p2Play(panelIndex, selectedHand)
          : null;
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
        <ScoreChip
          label={isVersus ? "P1" : "自陣"}
          value={lines.playerLines}
          tone="success"
        />
        <ScoreChip
          label={isVersus ? "P2" : "CPU"}
          value={lines.cpuLines}
          tone="error"
        />
      </View>

      <Text
        style={[
          textVariants.headingMd,
          styles.turnLabel,
          turn === "cpu" && styles.turnLabelCpu,
        ]}
        accessibilityLiveRegion="polite"
      >
        {isVersus
          ? turn === "player"
            ? "プレイヤー1 の番"
            : "プレイヤー2 の番"
          : turn === "player"
            ? "あなたのターン"
            : "思考中…"}
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
            state={
              isVersus
                ? result.winner === "tie"
                  ? "idle"
                  : "celebrate"
                : result.winner === "player"
                  ? "celebrate"
                  : "sad"
            }
            size={80}
          />
          <Text style={textVariants.headingMd}>
            {isVersus
              ? result.winner === "tie"
                ? "引き分け"
                : result.winner === "player"
                  ? "プレイヤー1 の勝ち!"
                  : "プレイヤー2 の勝ち!"
              : result.winner === "player"
                ? "勝利!"
                : result.winner === "tie"
                  ? "引き分け"
                  : "敗北…"}
          </Text>
          <PrimaryButton label="結果へ進む" onPress={() => goToResult(result)} />
        </View>
      )}

      <ConfettiOverlay
        visible={
          !!result && (isVersus ? result.winner !== "tie" : result.winner === "player")
        }
      />
    </Screen>
  );
}

interface TileProps {
  panel: PanelState | undefined;
  onPress: () => void;
  highlighted: boolean;
}

function PanelTile({ panel, onPress, highlighted }: TileProps) {
  const styles = useStyles();
  const { colors } = useTheme();
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
          {formatHitCountJa(panel.lastHitCount)}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = makeUseStyles((colors) => ({
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
}));
