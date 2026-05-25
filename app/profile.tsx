import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MascotView, Screen } from "@/shared/components";
import type { Mode } from "@/data/models";
import { progressRepository } from "@/data/repositories/progressRepository";
import {
  colors,
  modeColor,
  radii,
  shadows,
  spacing,
  textVariants,
} from "@/shared/theme";

const MODES: { id: Mode; title: string; icon: string }[] = [
  { id: "compare", title: "どちらが多い?", icon: "⚖️" },
  { id: "speed", title: "早打ち", icon: "🔫" },
  { id: "panel9", title: "パネル9", icon: "🎯" },
  { id: "stairs", title: "階段", icon: "🪜" },
];

export default function ProfileScreen() {
  const all = React.useMemo(() => progressRepository.all(), []);

  const totalPlays = Object.values(all).reduce(
    (sum, p) => sum + p.playCount,
    0,
  );

  return (
    <Screen scrollable padded>
      <View style={styles.header}>
        <MascotView state="idle" size={88} />
        <View style={{ flex: 1, marginLeft: spacing.lg }}>
          <Text style={textVariants.headingLg}>あなたの記録</Text>
          <Text
            style={[
              textVariants.bodyMd,
              { color: colors.textSecondary, marginTop: spacing.xs },
            ]}
          >
            合計 {totalPlays} 回プレイ
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {MODES.map((m) => {
          const p = all[m.id];
          return (
            <View
              key={m.id}
              style={[styles.card, { borderLeftColor: modeColor(m.id) }]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.icon}>{m.icon}</Text>
                <Text style={textVariants.headingMd}>{m.title}</Text>
              </View>
              <View style={styles.statRow}>
                <StatBlock label="ベスト" value={p.bestScore.toLocaleString()} />
                <StatBlock label="回数" value={p.playCount} />
                <StatBlock
                  label="最終プレイ"
                  value={
                    p.lastPlayedAt
                      ? new Date(p.lastPlayedAt).toLocaleDateString("ja-JP")
                      : "—"
                  }
                />
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[textVariants.caption, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={textVariants.headingSm}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  list: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderLeftWidth: 6,
    ...shadows.card,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    gap: spacing.xxs,
  },
});
