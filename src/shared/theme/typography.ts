import { Platform, TextStyle } from "react-native";

/**
 * Font families. On native we use the bundled @expo-google-fonts assets (the
 * weight is baked into the family name). On web those asset-based families load
 * unreliably under static export, so we reference the canonical Google Fonts
 * families instead — loaded via a <link> in app/+html.tsx — and drive weight
 * through `fontWeight` in each variant below.
 */
export const fontFamilies = {
  heading: Platform.select({
    web: '"Zen Maru Gothic", sans-serif',
    default: "ZenMaruGothic_700Bold",
  }),
  headingMedium: Platform.select({
    web: '"Zen Maru Gothic", sans-serif',
    default: "ZenMaruGothic_500Medium",
  }),
  body: Platform.select({
    web: '"Noto Sans JP", sans-serif',
    default: "NotoSansJP_400Regular",
  }),
  bodyBold: Platform.select({
    web: '"Noto Sans JP", sans-serif',
    default: "NotoSansJP_700Bold",
  }),
  button: Platform.select({
    web: '"M PLUS Rounded 1c", sans-serif',
    default: "MPLUSRounded1c_700Bold",
  }),
  mono: Platform.select({
    web: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
} as const;

// On web the canonical families need an explicit weight; on native the weighted
// family name already encodes it (and RN ignores fontWeight for custom fonts).
const w = (weight: TextStyle["fontWeight"]): TextStyle =>
  Platform.OS === "web" ? { fontWeight: weight } : {};

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

// react-native-web gives <Text> an explicit default color of black (it does
// NOT inherit), so a root color cascade can't reach top-level text. Instead we
// default every variant's color to a CSS variable that ThemeProvider sets per
// scheme; any explicit color passed later in a style array still overrides it.
const webDefaultColor: TextStyle =
  Platform.OS === "web" ? { color: "var(--app-text, #3C3C3C)" } : {};

const baseVariants: Record<TextVariant, TextStyle> = {
  displayLg: {
    fontFamily: fontFamilies.heading,
    ...w("700"),
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  displayMd: {
    fontFamily: fontFamilies.heading,
    ...w("700"),
    fontSize: 32,
    lineHeight: 40,
  },
  headingLg: {
    fontFamily: fontFamilies.heading,
    ...w("700"),
    fontSize: 26,
    lineHeight: 32,
  },
  headingMd: {
    fontFamily: fontFamilies.headingMedium,
    ...w("500"),
    fontSize: 20,
    lineHeight: 26,
  },
  headingSm: {
    fontFamily: fontFamilies.headingMedium,
    ...w("500"),
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamilies.body,
    ...w("400"),
    fontSize: 17,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamilies.body,
    ...w("400"),
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fontFamilies.body,
    ...w("400"),
    fontSize: 13,
    lineHeight: 18,
  },
  buttonLg: {
    fontFamily: fontFamilies.button,
    ...w("700"),
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  buttonMd: {
    fontFamily: fontFamilies.button,
    ...w("700"),
    fontSize: 16,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilies.body,
    ...w("400"),
    fontSize: 12,
    lineHeight: 16,
  },
  number: {
    fontFamily: fontFamilies.button,
    ...w("700"),
    fontSize: 28,
    lineHeight: 34,
    fontVariant: ["tabular-nums"],
  },
};

// Merge the web default text color into every variant (variant-defined colors,
// of which there are none, would still win).
export const textVariants = Object.fromEntries(
  Object.entries(baseVariants).map(([key, style]) => [
    key,
    { ...webDefaultColor, ...style },
  ]),
) as Record<TextVariant, TextStyle>;
