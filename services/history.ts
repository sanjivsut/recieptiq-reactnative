// Scan history, persisted to AsyncStorage. New for mobile — no web equivalent.

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OcrEngine, ReceiptSummary } from "../lib/types";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  source: "sample" | "photo";
  store?: string;
  date?: string;
  engine?: OcrEngine;
  summary: ReceiptSummary;
}

const HISTORY_KEY = "receiptiq:history";
const MAX_ENTRIES = 50;

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): Promise<void> {
  const existing = await loadHistory();
  const next: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [next, ...existing].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function deleteHistoryEntry(id: string): Promise<HistoryEntry[]> {
  const existing = await loadHistory();
  const updated = existing.filter((e) => e.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
