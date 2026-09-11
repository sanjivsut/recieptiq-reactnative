import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { deleteHistoryEntry, loadHistory, type HistoryEntry } from "../services/history";
import { ScreenHeader } from "../components/ScreenHeader";
import { SummaryStrip } from "../components/SummaryStrip";
import { ReceiptView } from "../components/ReceiptView";
import { EngineBadge } from "../components/EngineBadge";
import { formatMoney } from "../lib/format";
import { colors, fonts, radius, spacing } from "../theme";

export function HistoryScreen() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState<HistoryEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadHistory().then((h) => {
        if (alive) setEntries(h);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const remove = useCallback(async (id: string) => {
    const updated = await deleteHistoryEntry(id);
    setEntries(updated);
  }, []);

  return (
    <View style={styles.screen}>
      <ScreenHeader />
      <FlatList
        contentContainerStyle={styles.list}
        data={entries}
        keyExtractor={(e) => e.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No scans yet. Run a sample or scan a photo from the Scan tab — it&apos;ll show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => setOpen(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.store}>{item.store || "Scanned receipt"}</Text>
              <Text style={styles.meta}>
                {new Date(item.createdAt).toLocaleString()} · flagged {formatMoney(item.summary.flaggedAmount, item.summary.currency)}
              </Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(item.id)}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)}>
        <ScrollView style={styles.modalScreen} contentContainerStyle={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(null)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          {open ? (
            <>
              <SummaryStrip summary={open.summary} />
              <View style={{ height: spacing.sm }} />
              <ReceiptView
                summary={open.summary}
                store={open.store}
                date={open.date}
                engineSlot={open.engine ? <EngineBadge engine={open.engine} /> : undefined}
              />
            </>
          ) : null}
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paperCream,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  empty: {
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    color: colors.greyBrown,
    textAlign: "center",
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.inkNavy,
    borderRadius: radius,
    backgroundColor: colors.paperWhite,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  store: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.inkNavy,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.greyBrown,
    marginTop: 2,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.stampRed,
    borderRadius: radius,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 11,
    color: colors.stampRed,
    textTransform: "uppercase",
  },
  modalScreen: {
    flex: 1,
    backgroundColor: colors.paperCream,
  },
  modalContent: {
    padding: spacing.lg,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  closeText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    color: colors.stampRed,
    textTransform: "uppercase",
  },
});
