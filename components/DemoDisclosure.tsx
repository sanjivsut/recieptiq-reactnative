import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing } from "../theme";

/** Persistent, visible demo/illustrative-data disclosure. Confident tone, not
 *  buried in a menu — same copy as the web app. */
export function DemoDisclosure({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.box, compact && styles.compact]}>
      <Text style={styles.text}>
        <Text style={styles.strong}>Demo project — illustrative data. </Text>
        ReceiptIQ is built to showcase receipt-scanning and price-flagging logic. Pricing data is
        illustrative, not live-verified — don&apos;t use it to make real purchasing decisions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: colors.greyBrown,
    borderRadius: radius,
    backgroundColor: colors.heroMint,
    padding: spacing.md,
  },
  compact: {
    paddingVertical: spacing.sm,
  },
  text: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkNavy,
  },
  strong: {
    fontFamily: fonts.monoSemiBold,
  },
});
