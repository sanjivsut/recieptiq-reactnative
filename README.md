# ReceiptIQ Mobile

A native iOS/Android/web port of [ReceiptIQ](https://github.com/sanjivsut/reciept-iq) — a
receipt/listing analyzer that flags overpriced items and hidden subscription/fee traps. This is a
**portfolio demo**: the matching/flagging logic is real and unit-tested; the price data is a
curated dataset, not a live API.

Built with Expo (SDK 54 — pinned deliberately to Snack's current supported ceiling, see below) +
TypeScript, structured specifically so it can be **imported straight
into [Expo Snack](https://snack.expo.dev) from this GitHub repo**.

## Why this isn't a byte-for-byte port of the original build spec

The original build prompt called for Expo Router and an on-device ML Kit OCR fallback. Both were
dropped here, deliberately, because they conflict with Snack compatibility:

- **Expo Router → plain `App.tsx` + React Navigation.** Snack's GitHub import expects a root
  `App.js`/`App.tsx` file exporting the app component. Expo Router apps don't have one (routing
  replaces it), which is a documented, still-open compatibility gap
  ([expo/snack#459](https://github.com/expo/snack/issues/459),
  [expo/snack#613](https://github.com/expo/snack/issues/613)). This app uses a standard
  `@react-navigation/bottom-tabs` navigator from a root `App.tsx` instead — fully Snack-importable,
  and just as easy to reason about with only three flat screens.
- **No ML Kit / on-device OCR fallback.** Snack runs your code in Expo Go or a web preview, neither
  of which can load custom native modules like `@react-native-ml-kit/text-recognition`. This build
  is AI-OCR-only: real-photo scans call the deployed backend's `/api/ocr` route, and if that fails
  (no network, rate limit, backend not configured) the app shows a calm message and points you at
  the sample picker, which never touches OCR and always works. See the About tab for the honest
  version of this tradeoff.

Everything else in the original spec — the ported `lib/` logic, the curated dataset, the
sample-picker guarantees, the receipt/stamp visual language, the demo disclosure — is implemented
as specified.

## What's ported unchanged from the web app

`lib/matching.ts`, `lib/parse-receipt.ts`, `lib/flatten-price-db.ts`, `lib/format.ts`,
`lib/types.ts`, and their two test files are copied byte-identical (the only edit is removing the
`from "vitest"` import, since Jest injects `describe`/`it`/`expect` as globals). Run them with:

```bash
npm test
```

`assets/data/sample-receipts.json` and `assets/data/price-db-core.json` are also copied unchanged.

## Project setup

```bash
npm install
npx expo start          # then press i / a / w, or scan the QR code in Expo Go
```

Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` to your deployed ReceiptIQ web
app's origin (e.g. `https://reciept-iq.vercel.app`) to enable real-photo AI scanning. Without it,
the app still runs fully: the sample picker and offline price matching work with zero network, and
a real-photo scan shows a calm "AI scanning isn't set up" message instead of erroring.

`EXPO_PUBLIC_*` vars are baked into the client bundle by design (Expo's equivalent of Next's
`NEXT_PUBLIC_*`) — that's fine here since it's just a base URL. The Gemini API key stays
server-side in the web app and is never part of this bundle.

## Importing into Expo Snack

1. Push this repo to GitHub (public, or a private repo Snack can access).
2. Go to [snack.expo.dev](https://snack.expo.dev), find **"Project"** in the left file panel, click
   the **"…"** (three dots) next to it, and choose **Import git repository**.
3. Paste the repo URL and import. Snack detects `App.tsx` at the root automatically.
4. If you want AI-powered real-photo scanning inside the Snack preview, add
   `EXPO_PUBLIC_API_BASE_URL` under the Snack's environment/config (or just hardcode it temporarily
   in `services/ocr-ai.ts` for a quick demo — don't commit a hardcoded value back to `main`).
5. The sample-picker flow and offline price matching work in Snack with no configuration at all.

**Known Snack limits that apply here:** camera capture (`expo-image-picker`'s
`launchCameraAsync`) works in the Expo Go / device preview but not in Snack's in-browser web
preview (no camera access from an iframe); use "Upload image" there instead, or scan the QR code
into Expo Go on a real device to test the camera path.

### If "Import git repository" fails with an asset-upload error

As of this writing, Snack's git-import feature has an intermittent server-side bug unrelated to
this repo's content — it fails with `Error parsing files: Failed to upload file asset (... "$":
Required ...)` even though every individual file uploads fine via Snack's own public API. This
looks like a live issue in Expo's `snackager` service, not something fixable from here (worth
checking [expo/snack issues](https://github.com/expo/snack/issues) for updates, or filing a new
one with that exact error text).

A verified-working Snack built from this exact repo state (proving the app itself runs correctly
once past the import bug) is here: **https://snack.expo.dev/KVe3WKwCB4kPgVtndkIGR** — note it's
unsaved/anonymous and may expire; re-import once Expo's bug is fixed, or ask for a fresh one.

Also note: Snack's actual maximum supported SDK is **54**, not the project's SDK — this repo is
pinned to SDK 54 versions of Expo/React Native specifically so it runs in Snack once imported;
don't `expo upgrade` past 54 without checking Snack's current ceiling first, or the preview will
silently downgrade and get stuck on "Connecting…" forever.

## Testing

```bash
npm test          # ported unit tests (jest-expo)
npm run typecheck # tsc --noEmit
```

## Building for real devices (EAS)

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

Requires a free Expo account; a real device install additionally needs an Apple Developer account
(iOS) or Play Console account (Android) — both can be deferred while developing against Expo Go,
the Snack preview, or a simulator. `eas.json` already wires `EXPO_PUBLIC_API_BASE_URL` into every
build profile — update it to your own deployment's URL before building.

```bash
npx eas submit --platform ios
npx eas submit --platform android
```

## Regenerating icons/splash

`scripts/generate-assets.mjs` rasterizes `design/icon-source.svg` and
`design/icon-foreground-source.svg` (both ported from the web repo's `public/icon.svg`) into the
PNGs `app.json` references. These SVG sources live outside `assets/` deliberately — Expo Snack's
git importer scans the whole repo for binary-looking files and chokes on raw SVGs there, even
though Metro never touches them at runtime (they're only read here, at build time):

```bash
npm run build:assets
```

## Project structure

```
receiptiq-mobile/
├── App.tsx                  # root: font loading, splash, bottom tab navigator
├── entry.ts                 # registerRootComponent entry (local dev / EAS builds — deliberately
│                               not named index.ts/js, since Snack's own runtime treats a literal
│                               index.ts/js file as its entry regardless of package.json's "main",
│                               which would otherwise shadow App.tsx's default export)
├── screens/
│   ├── ScanScreen.tsx        # sample picker + camera/upload + result (primary screen)
│   ├── HistoryScreen.tsx     # past scans, AsyncStorage-backed
│   └── AboutScreen.tsx       # ported About content + demo disclosure
├── components/
│   ├── Icon.tsx               # react-native-svg port of the web icon set
│   ├── Wordmark.tsx            # react-native-svg port of the horizontal wordmark
│   ├── VerdictStamp.tsx
│   ├── EngineBadge.tsx
│   ├── SummaryStrip.tsx
│   ├── ReceiptView.tsx         # the annotated, receipt-shaped result
│   ├── DemoDisclosure.tsx
│   └── ScreenHeader.tsx
├── lib/                      # ported unchanged from the web repo
│   ├── matching.ts / matching.test.ts
│   ├── parse-receipt.ts / parse-receipt.test.ts
│   ├── flatten-price-db.ts
│   ├── format.ts
│   └── types.ts
├── services/
│   ├── ocr-ai.ts              # calls {API_BASE_URL}/api/ocr
│   ├── prices.ts               # fetch {API_BASE_URL}/api/prices, AsyncStorage cache, core-JSON fallback
│   └── history.ts              # AsyncStorage-backed scan history
├── theme.ts                  # color/font/spacing tokens — the RN equivalent of globals.css
├── assets/
│   ├── data/
│   │   ├── price-db-core.json   # bundled offline subset (ported unchanged)
│   │   ├── price-db.json        # full dataset, used only by the ported unit tests
│   │   └── sample-receipts.json # ported unchanged
│   └── icon.png, adaptive-icon-foreground.png, splash.png, favicon.png
├── design/                   # SVG sources — never imported by app code, kept out of assets/
│   ├── icon-source.svg          # so Snack's git importer doesn't choke trying to upload them
│   ├── icon-foreground-source.svg
│   └── receiptiq-wordmark.svg
├── scripts/generate-assets.mjs
├── app.json / eas.json
└── .env.example
```

## Honesty note

ReceiptIQ is a demo project built to showcase receipt-scanning and price-flagging logic. Pricing
data is illustrative, not live-verified — don't use it to make real purchasing decisions.
