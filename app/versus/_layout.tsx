import { Stack } from "expo-router";
import React from "react";

export default function VersusLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="handoff" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
