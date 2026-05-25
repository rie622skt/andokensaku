import {
  MPLUSRounded1c_700Bold,
} from "@expo-google-fonts/m-plus-rounded-1c";
import {
  NotoSansJP_400Regular,
  NotoSansJP_700Bold,
} from "@expo-google-fonts/noto-sans-jp";
import {
  ZenMaruGothic_500Medium,
  ZenMaruGothic_700Bold,
} from "@expo-google-fonts/zen-maru-gothic";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { HeaderBackButton } from "@/shared/components";
import { markStartup } from "@/core/utils/startupTimer";
import { colors } from "@/shared/theme";

markStartup("RootLayout module loaded");

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ZenMaruGothic_500Medium,
    ZenMaruGothic_700Bold,
    MPLUSRounded1c_700Bold,
    NotoSansJP_400Regular,
    NotoSansJP_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      markStartup("Fonts ready, splash hiding");
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.textInverse,
            headerTitleStyle: {
              fontFamily: "ZenMaruGothic_700Bold",
            },
            headerBackVisible: false,
            headerLeft: () => <HeaderBackButton />,
            contentStyle: { backgroundColor: colors.surfaceMuted },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(modes)" options={{ headerShown: false }} />
          <Stack.Screen
            name="tutorial"
            options={{ title: "はじめての検索バトル", presentation: "modal" }}
          />
          <Stack.Screen name="result" options={{ title: "結果" }} />
          <Stack.Screen name="settings" options={{ title: "設定" }} />
          <Stack.Screen name="profile" options={{ title: "プロフィール" }} />
          <Stack.Screen
            name="+not-found"
            options={{ title: "ページが見つかりません" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
