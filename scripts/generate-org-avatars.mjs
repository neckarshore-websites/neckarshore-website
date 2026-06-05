/**
 * GitHub Org Avatar Generator — config-driven
 *
 * Reads org definitions from `scripts/org-avatars.config.mjs` and renders each to a
 * transparent 512×512 PNG (true alpha via Playwright `omitBackground`). Badge letters
 * use the self-hosted Space Grotesk woff2 so they match the brand wordmark.
 *
 * Why transparent + safe-area padding: GitHub crops org avatars (rounded-square, and
 * circle in some surfaces). A full-bleed tile with a corner badge gets clipped. The
 * monogram sits at ~72% of the canvas with transparent padding, so nothing is cut.
 *
 * Design system: see docs/branding/README.md ("Org Avatars"). Geometry is fixed in
 * the config's DESIGN block — keep this generator and that doc in sync.
 *
 * Run: node scripts/generate-org-avatars.mjs
 */

import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { DESIGN, orgs } from "./org-avatars.config.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

async function fileToDataUrl(relPath, mime) {
  const buf = await readFile(resolve(ROOT, relPath));
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const baseImg = await fileToDataUrl(DESIGN.baseImage, "image/png");
const spaceGrotesk = await fileToDataUrl("src/fonts/SpaceGrotesk-Variable.woff2", "font/woff2");

function html(org) {
  const D = DESIGN;
  const badge = org.letter
    ? `<div class="badge" style="background:${org.color}">${org.letter}</div>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:"Space Grotesk";src:url(${spaceGrotesk}) format("woff2");font-weight:300 700;font-display:block}
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{background:transparent}
    #avatar{position:relative;width:${D.canvas}px;height:${D.canvas}px}
    .icon{position:absolute;left:${D.pad}px;top:${D.pad}px;width:${D.icon}px;height:${D.icon}px;
      border-radius:${D.iconRadius};overflow:hidden;background:${D.squircleBg}}
    .icon img{display:block;width:100%;height:100%}
    .badge{position:absolute;right:${D.badgeOffset}px;bottom:${D.badgeOffset}px;
      width:${D.badge}px;height:${D.badge}px;border-radius:${D.badgeRadius};
      display:flex;align-items:center;justify-content:center;color:#fff;
      font-family:"Space Grotesk",sans-serif;font-weight:${D.letterWeight};
      font-size:${D.letterSize}px;line-height:1;
      box-shadow:0 0 0 ${D.ring}px ${D.squircleBg}}
  </style></head><body>
    <div id="avatar"><div class="icon"><img src="${baseImg}"></div>${badge}</div>
  </body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
const outDir = resolve(ROOT, DESIGN.outDir);
await mkdir(outDir, { recursive: true });

for (const org of orgs) {
  await page.setContent(html(org), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator("#avatar");
  const dest = join(outDir, `neckarshore-org-${org.key}.png`);
  // omitBackground → transparent canvas; element bbox is exactly canvas×canvas px.
  await writeFile(dest, await el.screenshot({ omitBackground: true }));
  const { size } = await stat(dest);
  console.log(`  ${org.key.padEnd(9)} → ${DESIGN.outDir}/neckarshore-org-${org.key}.png  (${(size / 1024).toFixed(0)} KB)`);
}

await browser.close();
console.log("Done. Upload via GitHub → Org → Settings → Profile → Upload new picture.");
