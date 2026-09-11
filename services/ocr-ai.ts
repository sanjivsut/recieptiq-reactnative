// Client helper for the AI OCR path — the RN equivalent of the web app's
// lib/ocr-ai.ts. Calls the existing, unmodified `POST /api/ocr` route on the
// deployed web backend (same request/response contract: { image: dataUrl } ->
// { items } or { error, code }). The Gemini key never leaves that server.
//
// Snack / Expo Go can't run custom native modules, so this build has no
// on-device OCR fallback (no ML Kit, no Tesseract) — any failure here throws
// an `OcrAiError` with a calm, user-facing message; ScanScreen shows it and
// points the user at the always-reliable sample picker.

import { AppState } from "react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { LineItem } from "../lib/types";

// Real phone photos can be 3000+ px wide / several MB. Sent as-is, that's a
// lot of image tokens for the vision model to chew through — real photos
// were measured taking 25s+ (timing out) at full resolution. Downscaling to
// a width that's still plenty sharp for text keeps both the upload and the
// model's processing time reasonable.
const MAX_DIMENSION = 1600;

// On iOS, a fetch started in the split-second right after a native screen
// (the camera picker) dismisses can get killed by the OS as if the app were
// still backgrounded — surfacing as a "FetchRequestCanceledException" native
// error. Waiting for the app to genuinely report "active" (plus a short
// buffer) avoids starting the request in that window.
// https://github.com/expo/expo/issues/37932
function waitForForeground(timeoutMs = 3000): Promise<void> {
  if (AppState.currentState === "active") return new Promise((r) => setTimeout(r, 250));
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      sub.remove();
      resolve();
    }, timeoutMs);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        clearTimeout(timer);
        sub.remove();
        setTimeout(resolve, 250);
      }
    });
  });
}

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

// The backend allows up to 60s total (55s for the Gemini call itself, the
// Hobby-plan max) — give the client enough budget to actually see that
// response rather than timing out first, especially once base64 upload time
// is added on top. Gemini's free-tier latency has been observed to vary a
// lot request to request.
const TIMEOUT_MS = 65000;

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

  await waitForForeground();

  let base64: string;
  try {
    const resized = await manipulateAsync(imageUri, [{ resize: { width: MAX_DIMENSION } }], {
      compress: 0.7,
      format: SaveFormat.JPEG,
      base64: true,
    });
    if (!resized.base64) throw new Error("manipulateAsync returned no base64");
    base64 = resized.base64;
  } catch {
    throw new OcrAiError("bad_image", FALLBACK_COPY.bad_image);
  }
  const dataUrl = `data:image/jpeg;base64,${base64}`;

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
    // Expo's native fetch reports our AbortController-triggered cancellation
    // as a "FetchRequestCanceledException", not the spec `AbortError` name —
    // check the controller itself rather than the thrown error's name.
    if (controller.signal.aborted) {
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
