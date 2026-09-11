import { StyleSheet, Text, View } from "react-native";
import type { ReceiptSummary } from "../lib/types";
import { Icon, type IconName } from "./Icon";
import { colors, fonts, radius, spacing } from "../theme";

export function SummaryStrip({ summary }: { summary: ReceiptSummary }) {
  return (
    <View style={styles.strip}>
      <Cell icon="alert" tone={colors.stampRed} count={summary.overpricedCount} label="overpriced" />
      <Cell icon="ticket" tone={colors.stampRed} count={summary.trapCount} label="traps" />
      <Cell icon="check" tone={colors.stampGreen} count={summary.fairCount} label="fair" />
      <Cell icon="info" tone={colors.greyBrown} count={summary.unknownCount} label="no data" />
    </View>
  );
}

function Cell({
  icon,
  tone,
  count,
  label,
}: {
  icon: IconName;
  tone: string;
  count: number;
  label: string;
}) {
  return (
    <View style={styles.cell}>
      <Icon name={icon} size={14} color={tone} />
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.greyBrown,
    borderRadius: radius,
    padding: spacing.sm,
    backgroundColor: colors.paperWhite,
  },
  cell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  count: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.inkNavy,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
  },
});
