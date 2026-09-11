/* Rasterizes the committed SVG sources into the PNG assets app.json needs.
 * Adapted from the web repo's scripts/generate-assets.mjs (same sharp-based
 * approach), emitting Expo/EAS's exact dimensions instead of PWA manifest
 * sizes. Run with: npm run build:assets
 *
 * Sources (edit these, not the outputs):
 *   design/icon-source.svg             -> assets/icon.png (1024x1024)
 *   design/icon-foreground-source.svg  -> assets/adaptive-icon-foreground.png (1024x1024, transparent)
 *   design/icon-source.svg             -> assets/splash.png (1284x1284, centered on paper cream)
 *   design/icon-source.svg             -> assets/favicon.png (48x48, web tab icon)
 *
 * Sources live outside assets/ (in design/) rather than alongside the app's
 * real image assets — Expo Snack's git importer scans the whole repo for
 * binary-looking files to pre-populate its asset store, and chokes on raw
 * SVGs sitting there (they're not consumed by Metro's asset pipeline at
 * runtime anyway, only read here at build time).
 */
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const p = (...s) => path.join(root, ...s);

const PAPER_CREAM = "#FBF7EE";

async function main() {
  await mkdir(p("assets"), { recursive: true });

  const iconSvg = await readFile(p("design/icon-source.svg"));
  const fgSvg = await readFile(p("design/icon-foreground-source.svg"));

  await sharp(iconSvg, { density: 384 })
    .resize(1024, 1024, { fit: "contain", background: PAPER_CREAM })
    .flatten({ background: PAPER_CREAM })
    .png()
    .toFile(p("assets/icon.png"));

  await sharp(fgSvg, { density: 384 })
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(p("assets/adaptive-icon-foreground.png"));

  await sharp(iconSvg, { density: 384 })
    .resize(500, 500, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 392, bottom: 392, left: 392, right: 392, background: PAPER_CREAM })
    .png()
    .toFile(p("assets/splash.png"));

  await sharp(iconSvg, { density: 384 })
    .resize(48, 48, { fit: "contain", background: PAPER_CREAM })
    .flatten({ background: PAPER_CREAM })
    .png()
    .toFile(p("assets/favicon.png"));

  console.log("assets generated:");
  console.log("  assets/icon.png (1024x1024)");
  console.log("  assets/adaptive-icon-foreground.png (1024x1024, transparent)");
  console.log("  assets/splash.png (1284x1284)");
  console.log("  assets/favicon.png (48x48)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
