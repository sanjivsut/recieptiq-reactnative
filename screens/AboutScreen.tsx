import { ScrollView, StyleSheet, Text, View } from "react-native";
import coreDb from "../assets/data/price-db-core.json";
import { ScreenHeader } from "../components/ScreenHeader";
import { DemoDisclosure } from "../components/DemoDisclosure";
import { colors, fonts, spacing } from "../theme";

/** Ported content from the web app's /about page, updated for the mobile
 *  build: AI-only OCR (no on-device fallback engine, since Expo Snack / Expo
 *  Go can't load custom native modules like ML Kit or run Tesseract's WASM). */
export function AboutScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader />

      <Text style={styles.eyebrow}>About</Text>
      <Text style={styles.h1}>What ReceiptIQ is (and isn&apos;t)</Text>

      <View style={{ marginVertical: spacing.lg }}>
        <DemoDisclosure />
      </View>

      <Text style={styles.h2}>The verdict logic</Text>
      <Text style={styles.p}>Every line item gets two independent checks:</Text>
      <Text style={styles.li}>
        • <Text style={styles.strong}>Price check.</Text> The item name is fuzzy-matched against a
        curated "typical price" dataset (token overlap + edit distance, no ML). If it matches, the
        unit price is compared to that item&apos;s typical range and stamped Fair or Overpriced. No
        match means no price data — ReceiptIQ doesn&apos;t guess.
      </Text>
      <Text style={styles.li}>
        • <Text style={styles.strong}>Trap check.</Text> Independent of price, the line text is
        scanned for subscription &amp; fee trap language — membership, auto-renew, free trial,
        convenience fee, protection plan, service charge, and similar. A hit is stamped Fee / Sub
        trap. An item can carry both stamps.
      </Text>

      <Text style={styles.h2}>AI-powered OCR</Text>
      <Text style={styles.p}>
        For real photos, ReceiptIQ calls a vision model (Gemini) through a server route that holds
        the API key — it&apos;s never bundled into this app. The model returns structured line items
        directly.
      </Text>
      <Text style={styles.p}>
        This build has no on-device fallback engine. The web version of ReceiptIQ falls back to
        Tesseract.js when the AI call fails; that isn&apos;t possible here because Expo Snack and
        Expo Go can&apos;t load custom native modules (which rules out on-device ML Kit text
        recognition too). If the AI call fails — no network, a rate limit, a misconfigured backend —
        the app shows a calm message and points you at the sample picker, which never touches OCR
        and always works.
      </Text>
      <Text style={styles.muted}>
        Real-photo OCR accuracy depends on photo quality. This is a deliberately zero-cost demo
        pipeline, not a production OCR service.
      </Text>

      <Text style={styles.h2}>The price dataset</Text>
      <Text style={styles.p}>
        There is no dataset that contains "every product sold in India" — that&apos;s tens of
        millions of SKUs changing daily. Instead ReceiptIQ ships {coreDb.entries.length}+ curated,
        representative items bundled for offline use, with a larger catalog fetched from the backend
        when it&apos;s reachable.
      </Text>
      <Text style={styles.p}>
        Each entry stores a price range (min/max), not a single number, plus aliases for fuzzy
        matching. The ranges are illustrative ballpark figures based on general market knowledge —
        treat them as a working default, not verified live prices.
      </Text>

      <Text style={styles.h2}>Works offline</Text>
      <Text style={styles.p}>
        The sample picker never touches the network. Real-photo scanning needs connectivity to reach
        the AI backend, but basic price matching still works offline once you have text to match,
        using the bundled core price subset.
      </Text>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paperCream,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 12,
    color: colors.stampRed,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  h1: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.inkNavy,
    marginTop: 4,
  },
  h2: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    color: colors.inkNavy,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: spacing.lg,
    marginBottom: 6,
  },
  p: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkNavy,
    marginBottom: spacing.sm,
  },
  li: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkNavy,
    marginBottom: spacing.sm,
  },
  strong: {
    fontFamily: fonts.monoSemiBold,
  },
  muted: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.greyBrown,
  },
});
