import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, textVariants } from "@/shared/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={textVariants.displayMd}>ページが見つかりません</Text>
        <Link href="/" style={styles.link}>
          ホームに戻る
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  link: {
    ...textVariants.buttonMd,
    color: colors.primary,
  },
});
