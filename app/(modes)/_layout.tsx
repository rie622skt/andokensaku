import { Stack } from "expo-router";
import React from "react";

import { HeaderBackButton } from "@/shared/components";
import { colors } from "@/shared/theme";

export default function ModesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
        headerTitleStyle: { fontFamily: "ZenMaruGothic_700Bold" },
        headerBackVisible: false,
        headerLeft: () => <HeaderBackButton />,
        contentStyle: { backgroundColor: colors.surfaceMuted },
      }}
    >
      <Stack.Screen name="compare" options={{ title: "どちらが多い?" }} />
      <Stack.Screen name="speed" options={{ title: "早打ちケンサク銃士" }} />
      <Stack.Screen name="panel9" options={{ title: "ケンサク!パネル9" }} />
      <Stack.Screen name="stairs" options={{ title: "のぼるケンサク階段" }} />
    </Stack>
  );
}
