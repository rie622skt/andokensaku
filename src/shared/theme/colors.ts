// Brand / semantic accent colors are shared across light and dark; only the
// surfaces, borders and text colors differ per scheme.
const brand = {
  primary: "#1CB0F6",
  primaryDark: "#1899D6",
  success: "#58CC02",
  successDark: "#48A300",
  error: "#FF4B4B",
  errorDark: "#D63A3A",
  warning: "#FFC800",
  warningDark: "#E0B000",

  modeCompare: "#FF9600",
  modeSpeed: "#CE82FF",
  modePanel9: "#1CB0F6",
  modeStairs: "#58CC02",

  textInverse: "#FFFFFF",
} as const;

export const lightColors = {
  ...brand,
  textPrimary: "#3C3C3C",
  textSecondary: "#777777",

  surface: "#FFFFFF",
  surfaceMuted: "#F7F7F7",
  border: "#E5E5E5",

  overlay: "rgba(0,0,0,0.4)",
};

export type Palette = { [K in keyof typeof lightColors]: string };
export type ColorKey = keyof Palette;

export const darkColors: Palette = {
  ...brand,
  textPrimary: "#F1F7FB",
  textSecondary: "#A1B0BA",

  surface: "#1F2D33",
  surfaceMuted: "#131F24",
  border: "#37464F",

  overlay: "rgba(0,0,0,0.6)",
};

/**
 * Static light palette. Prefer `useTheme().colors` (or `makeUseStyles`) inside
 * components so dark mode applies; this alias remains for scheme-independent
 * contexts and backwards compatibility.
 */
export const colors = lightColors;

export const modeColor = (
  mode: "compare" | "speed" | "panel9" | "stairs",
): string => {
  switch (mode) {
    case "compare":
      return brand.modeCompare;
    case "speed":
      return brand.modeSpeed;
    case "panel9":
      return brand.modePanel9;
    case "stairs":
      return brand.modeStairs;
  }
};
