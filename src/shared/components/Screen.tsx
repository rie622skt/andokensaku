import React from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/shared/theme";

interface Props {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  background?: string;
  style?: ViewStyle;
  /** タブレット/Web で中央寄せする際の最大幅。デフォルト 640 */
  maxContentWidth?: number;
}

const TABLET_BREAKPOINT = 600;

export function Screen({
  children,
  scrollable = false,
  padded = true,
  background = colors.surfaceMuted,
  style,
  maxContentWidth = 640,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= TABLET_BREAKPOINT;

  const innerStyle: ViewStyle = padded ? { padding: spacing.lg } : {};
  const constrainStyle: ViewStyle = isWide
    ? { maxWidth: maxContentWidth, width: "100%", alignSelf: "center" }
    : {};

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWide && styles.scrollContentWide,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[innerStyle, constrainStyle, style]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.flex, innerStyle, constrainStyle, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  scrollContentWide: { alignItems: "center" },
});
