#!/usr/bin/env node
/**
 * Render a static HTML file to an exact-dimension PNG via headless Chromium.
 *
 * Why this exists:
 *   Static hero/promo images (Twitter/X cards, OG cards, social previews) need
 *   exact dimensions and pixel-perfect output. Browser screenshots on Retina
 *   default to deviceScaleFactor=2, producing 2x PNGs. This script pins
 *   deviceScaleFactor=1 and clips to the exact viewport.
 *
 *   Lives in neckarshore-website because Playwright is already a devDep here.
 *   Accepts absolute input/output paths so it can serve any site in the
 *   Linus-owned portfolio (neckarshore, rauhut, OGC, Goldoni).
 *
 * Usage:
 *   node scripts/render-x-asset.mjs --in <html-abs-path> --out <png-abs-path> \
 *        [--width 1200] [--height 675]
 *
 * Example (L17 Asset (3) — Pinned-Thread 4-Pillar):
 *   node scripts/render-x-asset.mjs \
 *     --in  ~/Developer/projects/neckarshore-ai/rauhut-website/public/x-assets/pinned-thread-c-4-pillar.html \
 *     --out ~/Developer/projects/neckarshore-ai/rauhut-website/public/x-assets/pinned-thread-c-4-pillar.png
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

function expand(p) {
  if (!p) return p;
  return p.startsWith("~") ? resolve(homedir(), p.slice(2)) : resolve(p);
}

const htmlPath = expand(arg("in"));
const pngPath = expand(arg("out"));
const width = Number(arg("width", 1200));
const height = Number(arg("height", 675));

if (!htmlPath || !pngPath) {
  console.error("Usage: render-x-asset.mjs --in <html> --out <png> [--width N] [--height N]");
  process.exit(1);
}
if (!existsSync(htmlPath)) {
  console.error(`HTML source not found: ${htmlPath}`);
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

await page.screenshot({
  path: pngPath,
  type: "png",
  fullPage: false,
  clip: { x: 0, y: 0, width, height },
});

await browser.close();
console.log(`Rendered ${pngPath} (${width}x${height})`);
