import { useMemo } from "react";
import { StyleSheet } from "react-native";

import type { Palette } from "./colors";
import { useTheme } from "./ThemeContext";

/**
 * Builds a `useStyles()` hook from a factory that receives the active palette.
 * Name the factory parameter `colors` so existing `colors.X` references inside
 * a StyleSheet body need no further changes:
 *
 *   const useStyles = makeUseStyles((colors) => ({
 *     card: { backgroundColor: colors.surface },
 *   }));
 *   // in component:
 *   const styles = useStyles();
 */
export function makeUseStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: Palette) => T,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
