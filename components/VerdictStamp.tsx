import { StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "./Icon";
import { colors, fonts, radius } from "../theme";

export type StampKind = "fair" | "over" | "trap" | "unknown";

const LABELS: Record<StampKind, string> = {
  fair: "Fair",
  over: "Overpriced",
  trap: "Fee / Sub trap",
  unknown: "No price data",
};

const ICONS: Record<StampKind, IconName> = {
  fair: "check",
  over: "alert",
  trap: "ticket",
  unknown: "info",
};

const TONE: Record<StampKind, string> = {
  fair: colors.stampGreen,
  over: colors.stampRed,
  trap: colors.stampRed,
  unknown: colors.greyBrown,
};

/** A rotated, rubber-stamp-style verdict badge. */
export function VerdictStamp({ kind, label }: { kind: StampKind; label?: string }) {
  const tone = TONE[kind];
  return (
    <View style={[styles.stamp, { borderColor: tone, transform: [{ rotate: "-2deg" }] }]}>
      <Icon name={ICONS[kind]} size={13} color={tone} />
      <Text style={[styles.label, { color: tone }]}>{label ?? LABELS[kind]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderRadius: radius,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
