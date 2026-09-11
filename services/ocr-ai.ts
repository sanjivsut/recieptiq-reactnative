// Client helper for the AI OCR path — the RN equivalent of the web app's
// lib/ocr-ai.ts. Calls the existing, unmodified `POST /api/ocr` route on the
// deployed web backend (same request/response contract: { image: dataUrl } ->
// { items } or { error, code }). The Gemini key never leaves that server.
//
// Snack / Expo Go can't run custom native modules, so this build has no
// on-device OCR fallback (no ML Kit, no Tesseract) — any failure here throws
// an `OcrAiError` with a calm, user-facing message; ScanScreen shows it and
// points the user at the always-reliable sample picker.

import * as FileSystem from "expo-file-system";
import type { LineItem } from "../lib/types";

export type OcrAiFailure =
  | "not_configured"
  | "no_key"
  | "rate_limited"
  | "upstream_error"
  | "bad_response"
  | "bad_image"
  | "timeout"
  | "network";

export class OcrAiError extends Error {
  code: OcrAiFailure;
  /** Calm, user-facing sentence describing what went wrong. */
  userMessage: string;

  constructor(code: OcrAiFailure, userMessage: string, message?: string) {
    super(message ?? userMessage);
    this.name = "OcrAiError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

const FALLBACK_COPY: Record<OcrAiFailure, string> = {
  not_configured:
    "AI scanning isn't set up in this build (no EXPO_PUBLIC_API_BASE_URL) — try a sample receipt instead.",
  no_key: "AI scanning isn't configured on the backend right now — try a sample receipt instead.",
  rate_limited: "AI scanning hit its usage limit for now — please try again shortly.",
  upstream_error: "The AI scanning service had a hiccup — please try again.",
  bad_response: "The AI scan came back in an unexpected shape — please try again.",
  bad_image: "That image couldn't be read — try a clearer photo.",
  timeout: "AI scanning took too long — please try again with a clearer photo.",
  network: "Couldn't reach the AI scanning service — check your connection and try again.",
};

export function fallbackMessage(code: OcrAiFailure): string {
  return FALLBACK_COPY[code];
}

const TIMEOUT_MS = 9000;

function mimeFromUri(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg";
}

interface OcrApiOk {
  items: LineItem[];
}
interface OcrApiErr {
  error: string;
  code?: OcrAiFailure;
}

/** Attempt AI OCR on a picked image URI. Resolves with line items, or throws
 *  `OcrAiError`. */
export async function recognizeWithAi(imageUri: string): Promise<LineItem[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new OcrAiError("not_configured", FALLBACK_COPY.not_configured);
  }

  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: "base64" });
  } catch {
    throw new OcrAiError("bad_image", FALLBACK_COPY.bad_image);
  }
  const dataUrl = `data:${mimeFromUri(imageUri)};base64,${base64}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/ocr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new OcrAiError("timeout", FALLBACK_COPY.timeout);
    }
    throw new OcrAiError("network", FALLBACK_COPY.network);
  }
  clearTimeout(timer);

  if (!res.ok) {
    let code: OcrAiFailure = "upstream_error";
    try {
      const body = (await res.json()) as OcrApiErr;
      if (body.code && body.code in FALLBACK_COPY) code = body.code;
      else if (res.status === 429) code = "rate_limited";
      else if (res.status === 501) code = "no_key";
    } catch {
      if (res.status === 429) code = "rate_limited";
    }
    throw new OcrAiError(code, FALLBACK_COPY[code]);
  }

  let data: OcrApiOk;
  try {
    data = (await res.json()) as OcrApiOk;
  } catch {
    throw new OcrAiError("bad_response", FALLBACK_COPY.bad_response);
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new OcrAiError("bad_response", FALLBACK_COPY.bad_response);
  }

  return data.items
    .filter((it) => it && typeof it.name === "string" && typeof it.price === "number")
    .map((it) => ({
      name: it.name.trim(),
      qty: Number.isFinite(it.qty) && it.qty > 0 ? Math.floor(it.qty) : 1,
      price: it.price,
    }));
}
