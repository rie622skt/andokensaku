import React from "react";
import { Platform, useColorScheme } from "react-native";

import { usePreferences } from "@/core/storage/preferences";
import { darkColors, lightColors, type Palette } from "./colors";

export type ActiveScheme = "light" | "dark";

interface ThemeValue {
  colors: Palette;
  scheme: ActiveScheme;
}

const ThemeContext = React.createContext<ThemeValue>({
  colors: lightColors,
  scheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = usePreferences((s) => s.colorScheme);
  const system = useColorScheme();
  const scheme: ActiveScheme =
    preference === "system" ? (system ?? "light") : preference;

  const value = React.useMemo<ThemeValue>(
    () => ({
      colors: scheme === "dark" ? darkColors : lightColors,
      scheme,
    }),
    [scheme],
  );

  // react-native-web gives <Text> an explicit black default color, so the
  // themed text color is driven by a CSS variable (--app-text) that every text
  // variant defaults to. Update it (and the page background) per scheme.
  React.useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const { colors } = value;
    const root = document.documentElement;
    root.style.setProperty("--app-text", colors.textPrimary);
    root.style.backgroundColor = colors.surfaceMuted;
    root.style.setProperty("color-scheme", scheme);
    if (document.body) {
      document.body.style.backgroundColor = colors.surfaceMuted;
    }
  }, [value, scheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  return React.useContext(ThemeContext);
}
