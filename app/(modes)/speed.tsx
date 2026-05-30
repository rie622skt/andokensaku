import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  CountdownRing,
  FeedbackPulse,
  MascotView,
  PrimaryButton,
  Screen,
  ScoreChip,
} from "@/shared/components";
import type { FeedbackKind } from "@/shared/components";
import { useHaptic } from "@/shared/hooks/useHaptic";
import { useSfx } from "@/shared/hooks/useSfx";
import { useSpeedStore } from "@/features/speed/store";
import { useVersusStore } from "@/features/versus/store";
import {
  colors,
  radii,
  shadows,
  spacing,
  textVariants,
} from "@/shared/theme";

const TICK_MS = 100;

export default function SpeedScreen() {
  const router = useRouter();
  const haptic = useHaptic();
  const sfx = useSfx();
  const params = useLocalSearchParams<{ players?: string }>();
  const isVersus = params.players === "2";
  const versusSeed = useVersusStore((s) => s.seed);
  const versusCurrent = useVersusStore((s) => s.current);
  const reportScore = useVersusStore((s) => s.reportScore);
  const {
    round,
    currentWord,
    score,
    combo,
    correctCount,
    wrongCount,
    remainingMs,
    finished,
    start,
    answer,
    tick,
    reset,
  } = useSpeedStore();

  React.useEffect(() => {
    start(isVersus ? versusSeed ?? undefined : undefined, isVersus);
    return () => reset();
  }, [start, reset, isVersus, versusSeed]);

  React.useEffect(() => {
    if (finished) return;
    const id = setInterval(() => tick(TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [finished, tick]);

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
            params: { mode: "speed", score: String(score) },
          });
        }
      }, 800);
      return () => clearTimeout(t);
    }
    return;
  }, [finished, router, score, isVersus, reportScore]);

  const [feedback, setFeedback] = React.useState<FeedbackKind>(null);
  const [feedbackTick, setFeedbackTick] = React.useState(0);

  const onAnswer = (decision: "yes" | "no") => {
    const j = answer(decision);
    if (!j) return;
    setFeedback(j.correct ? "correct" : "wrong");
    setFeedbackTick((t) => t + 1);
    if (j.correct) {
      haptic("success");
      sfx("correct");
    } else {
      haptic("error");
      sfx("wrong");
    }
  };

  if (!round) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <MascotView state="thinking" size={120} />
        </View>
      </Screen>
    );
  }

  const comparatorText =
    round.comparator === "over"
      ? `${round.threshold.toLocaleString()} 件 より多い?`
      : `${round.threshold.toLocaleString()} 件 より少ない?`;

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
        <CountdownRing remaining={remainingMs / 1000} total={round.duration_sec} size={72} />
      </View>

      <Text style={[textVariants.headingLg, styles.question]}>
        {comparatorText}
      </Text>

      <View style={styles.wordWrap}>
        <FeedbackPulse feedback={feedback} triggerKey={feedbackTick}>
          <MotiView
            key={currentWord?.word ?? "empty"}
            from={{ translateY: -40, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 14, stiffness: 180 }}
            style={styles.wordCard}
          >
            <Text style={textVariants.displayLg}>
              {currentWord?.word ?? "—"}
            </Text>
          </MotiView>
        </FeedbackPulse>
      </View>

      <View style={styles.buttons}>
        <PrimaryButton
          label="✓ YES"
          variant="success"
          size="lg"
          onPress={() => onAnswer("yes")}
          fullWidth
        />
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          label="✕ NO"
          variant="error"
          size="lg"
          onPress={() => onAnswer("no")}
          fullWidth
        />
      </View>

      <View style={styles.stats}>
        <Text style={[textVariants.bodySm, { color: colors.success }]}>
          ◯ {correctCount}
        </Text>
        <Text style={[textVariants.bodySm, { color: colors.error }]}>
          ✕ {wrongCount}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  versusBanner: {
    textAlign: "center",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  question: {
    textAlign: "center",
    marginTop: spacing.lg,
  },
  wordWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.lg,
  },
  wordCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
    ...shadows.card,
    minWidth: "70%",
    alignItems: "center",
  },
  buttons: {
    gap: spacing.md,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
