import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useHaptic } from "@/shared/hooks/useHaptic";
import { useSfx } from "@/shared/hooks/useSfx";
import { useVersusStore } from "@/features/versus/store";
import {
  ConfettiOverlay,
  FeedbackPulse,
  HitCounter,
  MascotView,
  PrimaryButton,
  Screen,
  ScoreChip,
} from "@/shared/components";
import { useCompareStore } from "@/features/compare/store";
import {
  makeUseStyles,
  modeColor,
  radii,
  shadows,
  spacing,
  textVariants,
  useTheme,
} from "@/shared/theme";

type Phase = "playing" | "reveal";

type Judgement = {
  correct: boolean;
  winner: "left" | "right" | "tie";
} | null;

function feedbackFor(
  side: "left" | "right",
  revealed: boolean,
  j: Judgement,
): "correct" | "wrong" | null {
  if (!revealed || !j) return null;
  if (j.winner === side) return "correct";
  if (!j.correct && j.winner !== "tie") return "wrong";
  return null;
}

export default function CompareScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const haptic = useHaptic();
  const sfx = useSfx();
  const params = useLocalSearchParams<{ players?: string }>();
  const isVersus = params.players === "2";
  const versusSeed = useVersusStore((s) => s.seed);
  const versusCurrent = useVersusStore((s) => s.current);
  const reportScore = useVersusStore((s) => s.reportScore);
  const {
    current,
    score,
    combo,
    index,
    totalQuestions,
    lastJudgement,
    finished,
    start,
    answer,
    next,
    reset,
  } = useCompareStore();
  const [phase, setPhase] = React.useState<Phase>("playing");
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    start(undefined, isVersus ? versusSeed ?? undefined : undefined, isVersus);
    return () => reset();
  }, [start, reset, isVersus, versusSeed]);

  React.useEffect(() => {
    if (finished) {
      const t = setTimeout(() => {
        if (isVersus) {
          const nextPhase = reportScore(score);
          router.replace(
            nextPhase === "handoff" ? "/versus/handoff" : "/versus/result",
          );
        } else {
          router.replace({
            pathname: "/result",
            params: { mode: "compare", score: String(score) },
          });
        }
      }, 800);
      return () => clearTimeout(t);
    }
    return;
  }, [finished, router, score, isVersus, reportScore]);

  const onChoose = (choice: "left" | "right") => {
    if (phase !== "playing" || !current) return;
    const j = answer(choice);
    if (!j) return;
    setPhase("reveal");
    setRevealed(true);
    if (j.correct) {
      haptic("success");
      sfx("correct");
    } else {
      haptic("error");
      sfx("wrong");
    }
  };

  const onNext = () => {
    setPhase("playing");
    setRevealed(false);
    next();
  };

  if (!current) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <MascotView state="thinking" size={120} />
          <Text style={textVariants.headingMd}>準備中…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded>
      {isVersus && (
        <Text
          style={[textVariants.headingMd, styles.versusBanner]}
          accessibilityLiveRegion="polite"
        >
          プレイヤー{versusCurrent} の番
        </Text>
      )}

      <View style={styles.hud}>
        <ScoreChip label="スコア" value={score} />
        <ScoreChip label="コンボ" value={`${combo}x`} tone="warning" />
        <ScoreChip
          label="問題"
          value={`${index + 1} / ${totalQuestions}`}
          tone="success"
        />
      </View>

      <Text style={[textVariants.headingLg, styles.question]}>
        どちらの方が検索ヒット数が多い?
      </Text>

      <View style={styles.cardRow}>
        <FeedbackPulse
          feedback={feedbackFor("left", revealed, lastJudgement)}
          triggerKey={index}
          style={styles.cardWrap}
        >
          <CompareCard
            word={current.left.word}
            hitCount={current.left.hit_count}
            revealed={revealed}
            winner={lastJudgement?.winner === "left"}
            onPress={() => onChoose("left")}
            accent={colors.modeCompare}
          />
        </FeedbackPulse>
        <View style={styles.vs}>
          <Text style={textVariants.headingLg}>VS</Text>
        </View>
        <FeedbackPulse
          feedback={feedbackFor("right", revealed, lastJudgement)}
          triggerKey={index}
          style={styles.cardWrap}
        >
          <CompareCard
            word={current.right.word}
            hitCount={current.right.hit_count}
            revealed={revealed}
            winner={lastJudgement?.winner === "right"}
            onPress={() => onChoose("right")}
            accent={colors.modeSpeed}
          />
        </FeedbackPulse>
      </View>

      {phase === "reveal" && lastJudgement && (
        <View style={styles.feedback}>
          <Text
            style={[
              textVariants.headingMd,
              {
                color: lastJudgement.correct ? colors.success : colors.error,
              },
            ]}
          >
            {lastJudgement.correct ? "正解!" : "残念…"}
          </Text>
          {current.explanation ? (
            <Text style={[textVariants.bodyMd, styles.explanation]}>
              {current.explanation}
            </Text>
          ) : null}
          <PrimaryButton
            label={index + 1 >= totalQuestions ? "結果を見る" : "つぎへ"}
            onPress={onNext}
            variant={index + 1 >= totalQuestions ? "success" : "primary"}
            fullWidth
          />
        </View>
      )}

      <ConfettiOverlay visible={lastJudgement?.correct === true} />
    </Screen>
  );
}

interface CompareCardProps {
  word: string;
  hitCount: number;
  revealed: boolean;
  winner: boolean;
  onPress: () => void;
  accent: string;
}

function CompareCard({
  word,
  hitCount,
  revealed,
  winner,
  onPress,
  accent,
}: CompareCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={revealed}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        { borderColor: accent },
        pressed && !revealed && styles.cardPressed,
        revealed && winner && styles.cardWinner,
        revealed && !winner && styles.cardLoser,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`「${word}」を選ぶ`}
    >
      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "timing", duration: 300 }}
      >
        <Text style={[textVariants.headingMd, styles.cardWord]} numberOfLines={2}>
          {word}
        </Text>
      </MotiView>
      <View style={styles.hitCountWrap}>
        {revealed ? (
          <HitCounter value={hitCount} fontSize={28} />
        ) : (
          <Text style={[textVariants.number, { color: colors.border }]}>
            ? ? ?
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const useStyles = makeUseStyles((colors) => ({
  versusBanner: {
    textAlign: "center",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: "wrap",
  },
  question: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  cardWrap: {
    flex: 1,
  },
  vs: {
    paddingHorizontal: spacing.xs,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderTopWidth: 6,
    alignItems: "center",
    minHeight: 180,
    justifyContent: "space-between",
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardWinner: {
    backgroundColor: "#E8F8DE",
    borderColor: colors.success,
  },
  cardLoser: {
    opacity: 0.6,
  },
  cardWord: {
    textAlign: "center",
    marginBottom: spacing.md,
  },
  hitCountWrap: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  feedback: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
    alignItems: "stretch",
  },
  explanation: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
}));
