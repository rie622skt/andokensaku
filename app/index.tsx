import { Link, Redirect, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MascotView, Screen } from "@/shared/components";
import { usePreferences } from "@/core/storage/preferences";
import { useVersusStore } from "@/features/versus/store";
import type { VersusMode } from "@/features/versus/store";
import { markStartup } from "@/core/utils/startupTimer";
import { makeUseStyles, modeColor, radii, shadows, spacing, textVariants, useTheme } from "@/shared/theme";

type Mode = "compare" | "speed" | "panel9" | "stairs";

interface ModeCard {
  id: Mode;
  title: string;
  subtitle: string;
  icon: string;
  route: "/(modes)/compare" | "/(modes)/speed" | "/(modes)/panel9" | "/(modes)/stairs";
}

const MODES: readonly ModeCard[] = [
  {
    id: "compare",
    title: "どちらが多い?",
    subtitle: "ふたつの言葉で対決。導入にぴったり。",
    icon: "⚖️",
    route: "/(modes)/compare",
  },
  {
    id: "speed",
    title: "早打ちケンサク銃士",
    subtitle: "テンポよく ○ / ✗ で答えよう。",
    icon: "🔫",
    route: "/(modes)/speed",
  },
  {
    id: "panel9",
    title: "ケンサク!パネル9",
    subtitle: "9マスの陣地をAND検索で奪い合う。",
    icon: "🎯",
    route: "/(modes)/panel9",
  },
  {
    id: "stairs",
    title: "のぼるケンサク階段",
    subtitle: "ヒット数が増える単語をひたすら積む。",
    icon: "🪜",
    route: "/(modes)/stairs",
  },
];

const SEQUENTIAL_MODES: readonly Mode[] = ["compare", "speed", "stairs"];

export default function HomeScreen() {
  const router = useRouter();
  const tutorialDone = usePreferences((s) => s.tutorialCompleted);
  const beginVersus = useVersusStore((s) => s.begin);
  const { width } = useWindowDimensions();
  const isWide = width >= 600;
  const [players, setPlayers] = React.useState<1 | 2>(1);
  const styles = useStyles();
  const { colors } = useTheme();

  React.useEffect(() => {
    markStartup("HomeScreen first render");
  }, []);

  const onPickMode = (mode: ModeCard) => {
    if (players === 2) {
      // Sequential modes need a fixed shared seed; panel9 plays one live board.
      if (SEQUENTIAL_MODES.includes(mode.id)) {
        beginVersus(mode.id as VersusMode);
      }
      router.push({ pathname: mode.route, params: { players: "2" } });
    } else {
      router.push(mode.route);
    }
  };

  if (!tutorialDone) {
    return <Redirect href="/tutorial" />;
  }

  return (
    <Screen scrollable padded background={colors.surfaceMuted}>
      <View style={styles.header}>
        <MascotView state="idle" size={88} />
        <View style={styles.greeting}>
          <Text style={textVariants.headingLg}>こんにちは!</Text>
          <Text
            style={[
              textVariants.bodyMd,
              { color: colors.textSecondary, marginTop: spacing.xs },
            ]}
          >
            検索ヒット数で遊ぼう。今日はどのモードにする?
          </Text>
        </View>
      </View>

      <View
        style={styles.playerToggle}
        accessibilityRole="radiogroup"
        accessibilityLabel="プレイ人数"
      >
        {([1, 2] as const).map((n) => (
          <Pressable
            key={n}
            onPress={() => setPlayers(n)}
            style={[
              styles.toggleOption,
              players === n && styles.toggleOptionActive,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: players === n }}
            accessibilityLabel={n === 1 ? "ひとりで遊ぶ" : "ふたりで遊ぶ"}
          >
            <Text
              style={[
                textVariants.buttonMd,
                players === n
                  ? { color: colors.textInverse }
                  : { color: colors.textSecondary },
              ]}
            >
              {n === 1 ? "👤 ひとり" : "👥 ふたり"}
            </Text>
          </Pressable>
        ))}
      </View>

      {players === 2 && (
        <Text style={[textVariants.bodySm, styles.toggleHint]}>
          同じ端末を交代しながら対戦します。
        </Text>
      )}

      <View style={[styles.modeGrid, isWide && styles.modeGridWide]}>
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            onPress={() => onPickMode(mode)}
            style={({ pressed }) => [
              styles.card,
              isWide && styles.cardWide,
              shadows.card,
              { borderColor: modeColor(mode.id) },
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={mode.title}
            accessibilityHint={mode.subtitle}
          >
            <View
              style={[
                styles.cardIconWrap,
                { backgroundColor: modeColor(mode.id) },
              ]}
            >
              <Text style={styles.cardIcon}>{mode.icon}</Text>
            </View>
            <Text style={textVariants.headingMd}>{mode.title}</Text>
            <Text
              style={[
                textVariants.bodySm,
                { color: colors.textSecondary, marginTop: spacing.xs },
              ]}
              numberOfLines={2}
            >
              {mode.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Link href="/settings" style={styles.footerLink}>
          設定
        </Link>
        <Link href="/profile" style={styles.footerLink}>
          プロフィール
        </Link>
      </View>
    </Screen>
  );
}

const useStyles = makeUseStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  greeting: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  playerToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    padding: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radii.pill,
    minHeight: 44,
    justifyContent: "center",
  },
  toggleOptionActive: {
    backgroundColor: colors.primary,
  },
  toggleHint: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  modeGrid: {
    gap: spacing.lg,
  },
  modeGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderLeftWidth: 6,
  },
  cardWide: {
    flexBasis: "48%",
    flexGrow: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  cardIcon: {
    fontSize: 26,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.xxl,
  },
  footerLink: {
    ...textVariants.buttonMd,
    color: colors.primary,
  },
}));
