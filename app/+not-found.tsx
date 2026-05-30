import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { makeUseStyles, spacing, textVariants } from "@/shared/theme";

export default function NotFoundScreen() {
  const styles = useStyles();
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

const useStyles = makeUseStyles((colors) => ({
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
}));
