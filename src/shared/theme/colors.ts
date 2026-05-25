export const colors = {
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

  textPrimary: "#3C3C3C",
  textSecondary: "#777777",
  textInverse: "#FFFFFF",

  surface: "#FFFFFF",
  surfaceMuted: "#F7F7F7",
  border: "#E5E5E5",

  darkBackground: "#131F24",
  darkSurface: "#1F2D33",
  darkSurfaceMuted: "#2A3940",
  darkBorder: "#37464F",
  darkTextPrimary: "#F1F7FB",
  darkTextSecondary: "#A1B0BA",

  overlay: "rgba(0,0,0,0.4)",
} as const;

export type ColorKey = keyof typeof colors;

export const modeColor = (
  mode: "compare" | "speed" | "panel9" | "stairs",
): string => {
  switch (mode) {
    case "compare":
      return colors.modeCompare;
    case "speed":
      return colors.modeSpeed;
    case "panel9":
      return colors.modePanel9;
    case "stairs":
      return colors.modeStairs;
  }
};
