// Client-side access to the price dataset — the RN equivalent of the web
// app's lib/prices-client.ts.
//
// Primary source is `${EXPO_PUBLIC_API_BASE_URL}/api/prices` (keeps the full
// catalog out of the app bundle, lets prices change without a rebuild). The
// result is cached in AsyncStorage so a warm start doesn't need the network.
// If there's no cache and the network request fails — offline, no backend
// configured — we fall back to the small `price-db-core.json` subset that IS
// bundled as a local asset, so basic matching still works with zero network.

import AsyncStorage from "@react-native-async-storage/async-storage";
import coreDb from "../assets/data/price-db-core.json";
import type { PriceEntry } from "../lib/types";

export type PriceSource = "catalog" | "offline-core";

export interface LoadedPrices {
  currency: string;
  entries: PriceEntry[];
  source: PriceSource;
}

const CACHE_KEY = "receiptiq:price-catalog";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function coreEntries(): LoadedPrices {
  const entries = (coreDb.entries as Omit<PriceEntry, "id">[]).map((e, i) => ({
    ...e,
    id: `core-${i}`,
  }));
  return { currency: coreDb.currency ?? "INR", entries, source: "offline-core" };
}

let cache: LoadedPrices | null = null;

async function readCachedCatalog(): Promise<LoadedPrices | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { currency: string; entries: PriceEntry[] };
    if (!Array.isArray(data.entries) || data.entries.length === 0) return null;
    return { currency: data.currency ?? "INR", entries: data.entries, source: "catalog" };
  } catch {
    return null;
  }
}

/** Loads the price catalog: cached/full catalog preferred, bundled core as
 *  the offline fallback. Never throws. */
export async function loadPriceEntries(): Promise<LoadedPrices> {
  if (cache) return cache;

  const cached = await readCachedCatalog();
  if (cached) cache = cached;

  if (API_BASE_URL) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE_URL}/api/prices`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as { currency: string; entries: PriceEntry[] };
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          const fresh: LoadedPrices = {
            currency: data.currency ?? "INR",
            entries: data.entries,
            source: "catalog",
          };
          cache = fresh;
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)).catch(() => {});
          return fresh;
        }
      }
    } catch {
      // fall through to whatever we already have
    }
  }

  if (cache) return cache;
  cache = coreEntries();
  return cache;
}
