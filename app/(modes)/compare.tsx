import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useHaptic } from "@/shared/hooks/useHaptic";
import { useSfx } from "@/shared/hooks/useSfx";
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
  colors,
  modeColor,
  radii,
  shadows,
  spacing,
  textVariants,
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
  const router = useRouter();
  const haptic = useHaptic();
  const sfx = useSfx();
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
    start();
    return () => reset();
  }, [start, reset]);

  React.useEffect(() => {
    if (finished) {
      const t = setTimeout(() => {
        router.replace({
          pathname: "/result",
          params: { mode: "compare", score: String(score) },
        });
      }, 800);
      return () => clearTimeout(t);
    }
    return;
  }, [finished, router, score]);

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

const styles = StyleSheet.create({
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
});
