import { StyleSheet, Text, View } from "react-native";
import type { OcrEngine } from "../lib/types";
import { Icon } from "./Icon";
import { colors, fonts, radius } from "../theme";

/**
 * Shows which OCR engine produced a result. A fallback notice, when present,
 * is rendered as a calm one-liner — never a red error banner — since a
 * fallback is a normal, expected mode of operation.
 */
export function EngineBadge({ engine, notice }: { engine: OcrEngine; notice?: string }) {
  const isAi = engine === "ai";
  return (
    <View style={{ gap: 6 }}>
      <View
        style={[
          styles.badge,
          { backgroundColor: isAi ? colors.heroMint : "#F1EEE7", borderColor: isAi ? colors.stampGreen : colors.greyBrown },
        ]}
      >
        <Icon name={isAi ? "sparkles" : "cpu"} size={13} color={isAi ? colors.stampGreen : colors.greyBrown} />
        <Text style={[styles.label, { color: isAi ? colors.stampGreen : colors.greyBrown }]}>
          {isAi ? "Scanned with AI" : "Scanned locally"}
        </Text>
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: radius,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  notice: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    color: colors.greyBrown,
    lineHeight: 18,
  },
});
