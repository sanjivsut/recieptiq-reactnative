import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ReceiptSummary } from "../lib/types";
import { formatMoney, formatPercent, formatRange } from "../lib/format";
import { VerdictStamp } from "./VerdictStamp";
import { Icon } from "./Icon";
import { colors, fonts, radius, spacing } from "../theme";

/**
 * The annotated, receipt-shaped result — RN View/Text port of the web app's
 * ReceiptView. Presentational only: takes an already-analyzed summary and
 * stamps it.
 */
export function ReceiptView({
  summary,
  store,
  date,
  engineSlot,
}: {
  summary: ReceiptSummary;
  store?: string;
  date?: string;
  engineSlot?: ReactNode;
}) {
  const { items, currency } = summary;

  return (
    <View style={styles.tape}>
      <View style={styles.head}>
        <Text style={styles.store}>{store || "Your receipt"}</Text>
        <Text style={styles.meta}>
          {date ? `${date} · ` : ""}
          {items.length} line item{items.length === 1 ? "" : "s"}
        </Text>
      </View>

      {engineSlot ? <View style={{ marginBottom: spacing.md }}>{engineSlot}</View> : null}

      <View style={styles.perforation} />

      <View>
        {items.map((a, i) => {
          const range = a.match ? formatRange(a.match.entry.min, a.match.entry.max, currency) : null;
          return (
            <View style={styles.line} key={`${a.item.name}-${i}`}>
              <View style={styles.lineTopRow}>
                <Text style={styles.lineName}>{a.item.name}</Text>
                <Text style={styles.linePrice}>
                  {formatMoney(a.item.price, currency)}
                  {a.item.qty > 1 ? <Text style={styles.muted}> ({a.item.qty}×)</Text> : null}
                </Text>
              </View>

              <Text style={styles.lineSub}>
                {a.match ? (
                  <>
                    matched <Text style={styles.strong}>{a.match.entry.name}</Text>
                    {a.match.entry.packSize ? ` (${a.match.entry.packSize})` : ""} · typical {range}
                    {a.item.qty > 1 ? ` · unit ${formatMoney(a.unitPrice, currency)}` : ""}
                  </>
                ) : (
                  "not in the price dataset — no price verdict"
                )}
              </Text>

              <View style={styles.stampsRow}>
                {a.priceVerdict === "fair" && <VerdictStamp kind="fair" />}
                {a.priceVerdict === "overpriced" && (
                  <VerdictStamp
                    kind="over"
                    label={a.overBy && a.overBy > 0 ? `Overpriced +${formatPercent(a.overBy)}` : "Overpriced"}
                  />
                )}
                {a.priceVerdict === "unknown" && !a.isTrap && <VerdictStamp kind="unknown" />}
                {a.isTrap && <VerdictStamp kind="trap" label={`Trap: ${a.trapTerms.join(", ")}`} />}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.perforation} />

      <View style={styles.totals}>
        <View style={styles.totalsLine}>
          <View style={styles.totalsLabel}>
            <Icon name="alert" size={13} color={colors.stampRed} />
            <Text style={styles.totalsLabelText}>Overpriced items</Text>
          </View>
          <Text style={styles.linePrice}>{summary.overpricedCount}</Text>
        </View>
        <View style={styles.totalsLine}>
          <View style={styles.totalsLabel}>
            <Icon name="ticket" size={13} color={colors.stampRed} />
            <Text style={styles.totalsLabelText}>Fee / subscription traps</Text>
          </View>
          <Text style={styles.linePrice}>{summary.trapCount}</Text>
        </View>
        <View style={styles.totalsLine}>
          <Text style={styles.totalsLabelText}>Not in dataset</Text>
          <Text style={styles.linePrice}>{summary.unknownCount}</Text>
        </View>
        <View style={styles.rule} />
        <View style={styles.totalsLine}>
          <Text style={styles.totalsLabelText}>Flagged amount</Text>
          <Text style={styles.linePrice}>{formatMoney(summary.flaggedAmount, currency)}</Text>
        </View>
        <View style={styles.totalsLine}>
          <Text style={styles.strongTotal}>Receipt total</Text>
          <Text style={styles.strongTotal}>{formatMoney(summary.total, currency)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tape: {
    backgroundColor: colors.paperWhite,
    borderWidth: 1.5,
    borderColor: colors.inkNavy,
    borderRadius: radius,
    padding: spacing.lg,
  },
  head: {
    marginBottom: spacing.sm,
  },
  store: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    color: colors.inkNavy,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
    marginTop: 2,
  },
  perforation: {
    borderTopWidth: 1,
    borderColor: colors.greyBrown,
    borderStyle: "dashed",
    marginVertical: spacing.sm,
    opacity: 0.6,
  },
  line: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE9DC",
    gap: 4,
  },
  lineTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  lineName: {
    flex: 1,
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    color: colors.inkNavy,
  },
  linePrice: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    color: colors.inkNavy,
  },
  muted: {
    fontFamily: fonts.mono,
    color: colors.greyBrown,
    fontSize: 12,
  },
  lineSub: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
  },
  strong: {
    fontFamily: fonts.monoSemiBold,
    color: colors.inkNavy,
  },
  stampsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  totals: {
    marginTop: spacing.sm,
    gap: 6,
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalsLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalsLabelText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.inkNavy,
  },
  rule: {
    borderTopWidth: 1,
    borderColor: colors.inkNavy,
    opacity: 0.2,
    marginVertical: 4,
  },
  strongTotal: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    color: colors.inkNavy,
  },
});
