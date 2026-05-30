import React from "react";
import { useColorScheme } from "react-native";

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

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  return React.useContext(ThemeContext);
}
