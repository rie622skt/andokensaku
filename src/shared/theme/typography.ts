import { Platform, TextStyle } from "react-native";

export const fontFamilies = {
  heading: Platform.select({
    default: "ZenMaruGothic_700Bold",
  }),
  headingMedium: Platform.select({
    default: "ZenMaruGothic_500Medium",
  }),
  body: Platform.select({
    default: "NotoSansJP_400Regular",
  }),
  bodyBold: Platform.select({
    default: "NotoSansJP_700Bold",
  }),
  button: Platform.select({
    default: "MPLUSRounded1c_700Bold",
  }),
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
} as const;

export type TextVariant =
  | "displayLg"
  | "displayMd"
  | "headingLg"
  | "headingMd"
  | "headingSm"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "buttonLg"
  | "buttonMd"
  | "caption"
  | "number";

export const textVariants: Record<TextVariant, TextStyle> = {
  displayLg: {
    fontFamily: fontFamilies.heading,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  displayMd: {
    fontFamily: fontFamilies.heading,
    fontSize: 32,
    lineHeight: 40,
  },
  headingLg: {
    fontFamily: fontFamilies.heading,
    fontSize: 26,
    lineHeight: 32,
  },
  headingMd: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 20,
    lineHeight: 26,
  },
  headingSm: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamilies.body,
    fontSize: 17,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonLg: {
    fontFamily: fontFamilies.button,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  buttonMd: {
    fontFamily: fontFamilies.button,
    fontSize: 16,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
  },
  number: {
    fontFamily: fontFamilies.mono,
    fontSize: 28,
    lineHeight: 34,
    fontVariant: ["tabular-nums"],
  },
};
