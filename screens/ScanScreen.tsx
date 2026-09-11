import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import sampleData from "../assets/data/sample-receipts.json";
import { analyzeReceipt } from "../lib/matching";
import type { OcrEngine, PriceEntry, ReceiptSummary, SampleReceipt } from "../lib/types";
import { loadPriceEntries, type PriceSource } from "../services/prices";
import { recognizeWithAi, OcrAiError } from "../services/ocr-ai";
import { addHistoryEntry } from "../services/history";
import { ScreenHeader } from "../components/ScreenHeader";
import { DemoDisclosure } from "../components/DemoDisclosure";
import { Icon } from "../components/Icon";
import { SummaryStrip } from "../components/SummaryStrip";
import { ReceiptView } from "../components/ReceiptView";
import { EngineBadge } from "../components/EngineBadge";
import { colors, fonts, radius, spacing } from "../theme";

const SAMPLES = (sampleData as { samples: SampleReceipt[] }).samples;

type Phase = "idle" | "ai" | "done" | "error";

interface Result {
  source: "sample" | "photo";
  engine?: OcrEngine;
  summary: ReceiptSummary;
  store?: string;
  date?: string;
}

export function ScanScreen() {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [priceSource, setPriceSource] = useState<PriceSource | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadPriceEntries().then((p) => {
      if (!alive) return;
      setEntries(p.entries);
      setCurrency(p.currency);
      setPriceSource(p.source);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (result) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [result]);

  const reset = useCallback(() => {
    setPhase("idle");
    setResult(null);
    setActiveSample(null);
    setErrorMsg(null);
    setPreview(null);
  }, []);

  const runSample = useCallback(
    (sample: SampleReceipt) => {
      if (!entries.length) return;
      setPreview(null);
      setErrorMsg(null);
      setActiveSample(sample.id);
      const summary = analyzeReceipt(sample.items, entries, currency);
      const next: Result = { source: "sample", summary, store: sample.store, date: sample.date };
      setResult(next);
      setPhase("done");
      addHistoryEntry({ source: "sample", store: sample.store, date: sample.date, summary }).catch(() => {});
    },
    [entries, currency],
  );

  const runPhoto = useCallback(
    async (uri: string) => {
      if (!entries.length) return;
      setActiveSample(null);
      setErrorMsg(null);
      setResult(null);
      setPreview(uri);
      setPhase("ai");

      try {
        const items = await recognizeWithAi(uri);
        const summary = analyzeReceipt(items, entries, currency);
        const next: Result = { source: "photo", engine: "ai", summary };
        setResult(next);
        setPhase("done");
        addHistoryEntry({ source: "photo", engine: "ai", summary }).catch(() => {});
      } catch (err) {
        const message =
          err instanceof OcrAiError
            ? err.userMessage
            : "AI scanning failed on that image. Try a different photo, or use a sample receipt.";
        setErrorMsg(message);
        setPhase("error");
      }
    },
    [entries, currency],
  );

  const pickFromLibrary = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Photo access needed",
        "Enable photo library access in Settings to upload a receipt image, or try a sample instead.",
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) void runPhoto(res.assets[0].uri);
  }, [runPhoto]);

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Camera access needed",
        "Enable camera access in Settings to take a photo, or upload an existing image instead.",
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) void runPhoto(res.assets[0].uri);
  }, [runPhoto]);

  const busy = phase === "ai";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader />

      <View style={styles.section}>
        <Text style={styles.h2}>1 · Pick a sample</Text>
        <Text style={styles.hint}>No OCR, no network — always reliable.</Text>
        <View style={styles.sampleList}>
          {SAMPLES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sampleButton, activeSample === s.id && styles.sampleButtonActive]}
              disabled={busy || !entries.length}
              onPress={() => runSample(s)}
            >
              <Text style={styles.sampleTitle}>{s.title}</Text>
              <Text style={styles.sampleBlurb}>{s.blurb}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>2 · Or scan a photo</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnGhost} disabled={busy} onPress={pickFromLibrary}>
            <Icon name="upload" size={15} color={colors.inkNavy} />
            <Text style={styles.btnGhostText}>Upload image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnRed} disabled={busy} onPress={takePhoto}>
            <Icon name="camera" size={15} color={colors.paperWhite} />
            <Text style={styles.btnRedText}>Take photo</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          Real-photo accuracy depends on lighting and focus — this is a zero-cost demo pipeline, not a
          production OCR service.
        </Text>
      </View>

      {preview ? <Image source={{ uri: preview }} style={styles.previewImage} /> : null}

      {priceSource === "offline-core" ? (
        <Text style={styles.notice}>Using the bundled offline price subset — full catalog unavailable right now.</Text>
      ) : null}

      {busy ? (
        <View style={styles.panel}>
          <ActivityIndicator color={colors.inkNavy} />
          <Text style={styles.progressText}>Analyzing with AI…</Text>
        </View>
      ) : null}

      {errorMsg ? (
        <View style={styles.section}>
          <Text style={styles.notice}>{errorMsg}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.section}>
          <SummaryStrip summary={result.summary} />
          <View style={{ height: spacing.sm }} />
          <ReceiptView
            summary={result.summary}
            store={result.store}
            date={result.date}
            engineSlot={
              result.source === "sample" ? (
                <Text style={styles.sampleBadge}>Sample receipt · no OCR run</Text>
              ) : result.engine ? (
                <EngineBadge engine={result.engine} />
              ) : undefined
            }
          />
          <View style={{ height: spacing.md }} />
          <TouchableOpacity style={styles.btnGhost} onPress={reset}>
            <Icon name="refresh" size={15} color={colors.inkNavy} />
            <Text style={styles.btnGhostText}>Scan another</Text>
          </TouchableOpacity>
        </View>
      ) : !busy && !errorMsg ? (
        <View style={styles.panel}>
          <Text style={styles.panelText}>
            Pick a sample above to see verdict stamps end to end, or scan a real receipt photo. Every line
            gets two independent checks: a price check against the curated dataset, and a keyword scan for
            subscription / fee traps.
          </Text>
        </View>
      ) : null}

      <View style={{ height: spacing.lg }} />
      <DemoDisclosure compact />
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
  section: {
    marginBottom: spacing.lg,
  },
  h2: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    color: colors.inkNavy,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hint: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  sampleList: {
    gap: spacing.sm,
  },
  sampleButton: {
    borderWidth: 1.5,
    borderColor: colors.inkNavy,
    borderRadius: radius,
    padding: spacing.md,
    backgroundColor: colors.paperWhite,
  },
  sampleButtonActive: {
    borderColor: colors.stampRed,
    backgroundColor: colors.heroMint,
  },
  sampleTitle: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.inkNavy,
  },
  sampleBlurb: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  btnGhost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.inkNavy,
    borderRadius: radius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  btnGhostText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    color: colors.inkNavy,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  btnRed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.stampRed,
    borderRadius: radius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  btnRedText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    color: colors.paperWhite,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: radius,
    borderWidth: 1.5,
    borderColor: colors.inkNavy,
    marginBottom: spacing.lg,
  },
  notice: {
    fontFamily: fonts.mono,
    fontSize: 12.5,
    color: colors.greyBrown,
    backgroundColor: colors.heroMint,
    borderWidth: 1,
    borderColor: colors.greyBrown,
    borderRadius: radius,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  panel: {
    borderWidth: 1.5,
    borderColor: colors.inkNavy,
    borderRadius: radius,
    backgroundColor: colors.paperWhite,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  panelText: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkNavy,
  },
  progressText: {
    fontFamily: fonts.monoMedium,
    fontSize: 13.5,
    color: colors.inkNavy,
    textAlign: "center",
  },
  sampleBadge: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
  },
});
