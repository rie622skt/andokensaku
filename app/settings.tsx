import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Screen } from "@/shared/components";
import { usePreferences, type ColorScheme } from "@/core/storage/preferences";
import { colors, radii, spacing, textVariants } from "@/shared/theme";

export default function SettingsScreen() {
  const prefs = usePreferences();

  return (
    <Screen scrollable padded>
      <Section title="サウンド">
        <Slider
          label="BGM"
          value={prefs.bgmVolume}
          onChange={prefs.setBgmVolume}
        />
        <Slider
          label="効果音"
          value={prefs.sfxVolume}
          onChange={prefs.setSfxVolume}
        />
      </Section>

      <Section title="触覚">
        <View style={styles.row}>
          <Text style={textVariants.bodyLg}>振動フィードバック</Text>
          <Switch
            value={prefs.hapticEnabled}
            onValueChange={prefs.setHapticEnabled}
          />
        </View>
      </Section>

      <Section title="表示">
        <View style={styles.rowColumn}>
          <Text style={textVariants.bodyLg}>カラーモード</Text>
          <View style={styles.segmentRow}>
            {(["system", "light", "dark"] as ColorScheme[]).map((scheme) => (
              <Pressable
                key={scheme}
                onPress={() => prefs.setColorScheme(scheme)}
                accessibilityRole="radio"
                accessibilityLabel={`カラーモード ${labelFor(scheme)}`}
                accessibilityState={{ selected: prefs.colorScheme === scheme }}
                style={[
                  styles.segment,
                  prefs.colorScheme === scheme && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    textVariants.buttonMd,
                    prefs.colorScheme === scheme && {
                      color: colors.textInverse,
                    },
                  ]}
                >
                  {labelFor(scheme)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Section>

      <Section title="言語">
        <View style={styles.segmentRow}>
          {(["ja", "en"] as const).map((lang) => (
            <Pressable
              key={lang}
              onPress={() => prefs.setLanguage(lang)}
              accessibilityRole="radio"
              accessibilityLabel={lang === "ja" ? "日本語" : "English"}
              accessibilityState={{ selected: prefs.language === lang }}
              style={[
                styles.segment,
                prefs.language === lang && styles.segmentActive,
              ]}
            >
              <Text
                style={[
                  textVariants.buttonMd,
                  prefs.language === lang && { color: colors.textInverse },
                ]}
              >
                {lang === "ja" ? "日本語" : "English"}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

function labelFor(scheme: ColorScheme): string {
  switch (scheme) {
    case "system":
      return "自動";
    case "light":
      return "ライト";
    case "dark":
      return "ダーク";
  }
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[textVariants.headingSm, styles.sectionTitle]}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function Slider({ label, value, onChange }: SliderProps) {
  // RN core does not ship a Slider in Expo SDK 52+ — we render a 5-step
  // segmented control instead. Good enough for MVP; swap to
  // @react-native-community/slider later if needed.
  const steps = [0, 0.25, 0.5, 0.75, 1];
  const activeIndex = steps.reduce(
    (best, v, i) => (Math.abs(v - value) < Math.abs(steps[best]! - value) ? i : best),
    0,
  );
  return (
    <View style={styles.rowColumn}>
      <View style={styles.rowSplit}>
        <Text style={textVariants.bodyLg}>{label}</Text>
        <Text style={textVariants.bodyMd}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.segmentRow}>
        {steps.map((step, i) => (
          <Pressable
            key={i}
            onPress={() => onChange(step)}
            style={[
              styles.stepDot,
              i <= activeIndex && styles.stepDotActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${label} ${Math.round(step * 100)}%`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowColumn: {
    gap: spacing.md,
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  segment: {
    flex: 1,
    minHeight: 44,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDot: {
    flex: 1,
    minWidth: 32,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
});
