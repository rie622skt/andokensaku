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

  // On web, react-native-web text defaults to `color: inherit`, so setting the
  // root color cascades the themed text color to every otherwise-uncolored
  // <Text>. This is what makes dark-mode text legible.
  React.useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const { colors } = value;
    const root = document.documentElement;
    root.style.backgroundColor = colors.surfaceMuted;
    root.style.color = colors.textPrimary;
    root.style.setProperty("color-scheme", scheme);
    if (document.body) {
      document.body.style.backgroundColor = colors.surfaceMuted;
      document.body.style.color = colors.textPrimary;
    }
  }, [value, scheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  return React.useContext(ThemeContext);
}
