import type { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? "andokensaku (dev)" : "andokensaku",
  slug: "andokensaku",
  scheme: "andokensaku",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV
      ? "com.andokensaku.app.dev"
      : "com.andokensaku.app",
  },
  android: {
    package: IS_DEV ? "com.andokensaku.app.dev" : "com.andokensaku.app",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#1CB0F6",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    name: "andokensaku",
    shortName: "andokensaku",
    description: "検索ヒット数で遊ぶ4モードのソロ専用ゲーム",
    lang: "ja",
    themeColor: "#1CB0F6",
    backgroundColor: "#FFFFFF",
    display: "standalone",
    orientation: "portrait",
    startUrl: "/",
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#FFFFFF",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      // projectId は `eas init` で発行後に自動挿入される
    },
  },
  updates: {
    // EAS Update を有効化するときに URL を設定
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
