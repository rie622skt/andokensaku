import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MascotView, PrimaryButton, Screen } from "@/shared/components";
import { usePreferences } from "@/core/storage/preferences";
import { makeUseStyles, spacing, textVariants, useTheme } from "@/shared/theme";

const STEPS = [
  {
    mascot: "idle" as const,
    title: "ようこそ!",
    body: "ここは、検索のヒット数で遊ぶゲームの世界だよ。",
  },
  {
    mascot: "thinking" as const,
    title: "ヒット数って?",
    body: "言葉をWebで検索したときに見つかるページの数のこと。多いほど人気な単語と考えてOK。",
  },
  {
    mascot: "celebrate" as const,
    title: "やってみよう!",
    body: "まずは『どちらが多い?』モードから。ふたつの言葉、どっちが検索結果が多そうかを当てるだけ。",
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const completeTutorial = usePreferences((s) => s.completeTutorial);
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = STEPS[stepIndex] ?? STEPS[0]!;
  const styles = useStyles();
  const { colors } = useTheme();

  const onNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      completeTutorial();
      router.replace("/");
    }
  };

  return (
    <Screen padded background={colors.surface}>
      <View style={styles.container}>
        <MascotView state={step.mascot} size={140} />
        <Text
          accessibilityRole="header"
          style={[textVariants.displayMd, styles.title]}
        >
          {step.title}
        </Text>
        <Text style={[textVariants.bodyLg, styles.body]}>{step.body}</Text>
      </View>
      <View style={styles.footer}>
        <View
          style={styles.dots}
          accessibilityRole="progressbar"
          accessibilityLabel={`ステップ ${stepIndex + 1} / ${STEPS.length}`}
        >
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === stepIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <PrimaryButton
          label={stepIndex === STEPS.length - 1 ? "はじめる" : "つぎへ"}
          onPress={onNext}
          fullWidth
        />
      </View>
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
  title: {
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  body: {
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
}));
