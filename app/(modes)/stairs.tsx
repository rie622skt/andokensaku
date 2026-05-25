import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
import { useStairsStore } from "@/features/stairs/store";
import {
  colors,
  radii,
  shadows,
  spacing,
  textVariants,
} from "@/shared/theme";

export default function StairsScreen() {
  const router = useRouter();
  const haptic = useHaptic();
  const sfx = useSfx();
  const {
    run,
    current,
    score,
    highestStep,
    finished,
    lastJudgement,
    start,
    answer,
    reset,
  } = useStairsStore();
  const [showFeedback, setShowFeedback] = React.useState(false);

  React.useEffect(() => {
    start();
    return () => reset();
  }, [start, reset]);

  React.useEffect(() => {
    if (finished) {
      const t = setTimeout(() => {
        router.replace({
          pathname: "/result",
          params: { mode: "stairs", score: String(score) },
        });
      }, 1500);
      return () => clearTimeout(t);
    }
    return;
  }, [finished, router, score]);

  const onAnswer = (choiceIndex: number) => {
    if (!current || showFeedback) return;
    const j = answer(choiceIndex);
    if (!j) return;
    setShowFeedback(true);
    if (j.correct) {
      haptic("success");
      sfx("stairsUp");
    } else {
      haptic("error");
      sfx("wrong");
    }
    setTimeout(() => setShowFeedback(false), 700);
  };

  if (!run) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <MascotView state="thinking" size={120} />
        </View>
      </Screen>
    );
  }

  // Sky color interpolation by step depth (0..max). Use only two stops to
  // keep things simple.
  const depthRatio = Math.min(1, highestStep / Math.max(1, run.max_steps));
  const skyTop = interpolateColor(["#FFD08A", "#5C3F8E"], depthRatio);
  const skyBottom = interpolateColor(["#FFFFFF", "#0C1A3D"], depthRatio);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[skyTop, skyBottom]}
        style={StyleSheet.absoluteFillObject}
      />
      <Screen padded background="transparent">
        <View style={styles.hud}>
          <ScoreChip label="スコア" value={score} />
          <ScoreChip label="高さ" value={`${highestStep}F`} tone="success" />
        </View>

        <View style={styles.body}>
          {current ? (
            <>
              <View style={styles.prevBox}>
                <Text style={[textVariants.caption, styles.muted]}>
                  ひとつ前
                </Text>
                <Text style={textVariants.headingMd}>
                  {current.previousWord.word}
                </Text>
                <Text style={[textVariants.number, styles.muted]}>
                  {current.previousWord.hit_count.toLocaleString()}
                </Text>
              </View>

              <Text
                style={[textVariants.headingLg, styles.question]}
                accessibilityRole="header"
              >
                これより{run.step_rules.must_exceed ? "多い" : "少ない"}のは?
              </Text>

              <View style={styles.choices}>
                {current.choices.map((choice, i) => {
                  const fk: FeedbackKind = !showFeedback || !lastJudgement
                    ? null
                    : lastJudgement.picked.word === choice.word
                      ? lastJudgement.correct
                        ? "correct"
                        : "wrong"
                      : !lastJudgement.correct &&
                          lastJudgement.expected.word === choice.word
                        ? "correct"
                        : null;
                  return (
                    <FeedbackPulse
                      key={i}
                      feedback={fk}
                      triggerKey={`${highestStep}-${i}`}
                    >
                      <Pressable
                        onPress={() => onAnswer(i)}
                        disabled={showFeedback}
                        style={({ pressed }) => [
                          styles.choice,
                          shadows.card,
                          pressed && styles.choicePressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`選択肢: ${choice.word}`}
                      >
                        <MotiView
                          from={{ translateY: 10, opacity: 0 }}
                          animate={{ translateY: 0, opacity: 1 }}
                          transition={{
                            type: "timing",
                            duration: 220,
                            delay: i * 60,
                          }}
                        >
                          <Text style={textVariants.headingSm}>
                            {choice.word}
                          </Text>
                        </MotiView>
                      </Pressable>
                    </FeedbackPulse>
                  );
                })}
              </View>
            </>
          ) : finished && lastJudgement ? (
            <View style={styles.centered}>
              <MascotView
                state={lastJudgement.correct ? "celebrate" : "sad"}
                size={120}
              />
              <Text style={textVariants.headingMd}>
                {lastJudgement.correct
                  ? `${highestStep}F まで登りきった!`
                  : `${highestStep}F で落下…`}
              </Text>
            </View>
          ) : null}
        </View>

        {finished && lastJudgement?.correct === false && (
          <View style={styles.feedback}>
            <Text style={[textVariants.bodyMd, { color: colors.surface }]}>
              正解は「{lastJudgement.expected.word}」(
              {lastJudgement.expected.hit_count.toLocaleString()}件) でした。
            </Text>
            <PrimaryButton
              label="結果へ進む"
              variant="primary"
              onPress={() =>
                router.replace({
                  pathname: "/result",
                  params: { mode: "stairs", score: String(score) },
                })
              }
              fullWidth
            />
          </View>
        )}

        <ConfettiOverlay visible={finished && lastJudgement?.correct === true} />
      </Screen>
    </View>
  );
}

/** Lerp between two hex colors. */
function interpolateColor(
  [a, b]: readonly [string, string],
  t: number,
): string {
  const ax = parseInt(a.slice(1), 16);
  const bx = parseInt(b.slice(1), 16);
  const ar = (ax >> 16) & 0xff;
  const ag = (ax >> 8) & 0xff;
  const ab = ax & 0xff;
  const br = (bx >> 16) & 0xff;
  const bg = (bx >> 8) & 0xff;
  const bb = bx & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  body: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
  },
  prevBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.card,
  },
  muted: {
    color: colors.textSecondary,
  },
  question: {
    color: colors.textInverse,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  choices: {
    gap: spacing.md,
  },
  choice: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  choicePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  feedback: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.overlay,
    borderRadius: radii.lg,
  },
});
