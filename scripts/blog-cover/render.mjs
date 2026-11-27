// Renders a blog cover from its HTML source in this folder.
//
//   node scripts/blog-cover/render.mjs <slug> [--channel chrome]
//
// Writes public/blog/<slug>/titelbild.webp (1920x1080) and og.jpg (1200x630: scaled to
// 1200x675, then 22 px cut from the top and 23 px from the bottom, as the first og.jpg was).
// The HTML loads its fonts from Google Fonts; that is only this render, nothing the site
// serves. `--channel chrome` uses the installed Chrome when Playwright's own browser is missing.
import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const slug = process.argv[2];
if (!slug) { console.error("usage: render.mjs <slug> [--channel chrome]"); process.exit(2); }
const i = process.argv.indexOf("--channel");
const channel = i > 0 ? process.argv[i + 1] : undefined;
const quelle = resolve("scripts/blog-cover", `${slug}.html`);
const ziel = resolve("public/blog", slug);
mkdirSync(ziel, { recursive: true });

const browser = await chromium.launch(channel ? { channel } : {});
const seite = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await seite.goto(pathToFileURL(quelle).href, { waitUntil: "networkidle" });
await seite.evaluate(() => document.fonts.ready);
const png = await seite.screenshot({ type: "png" });
await browser.close();

await sharp(png).webp({ quality: 90 }).toFile(join(ziel, "titelbild.webp"));
await sharp(png).resize(1200, 675).extract({ left: 0, top: 22, width: 1200, height: 630 })
  .jpeg({ quality: 88, mozjpeg: true }).toFile(join(ziel, "og.jpg"));
console.log(`${slug}: titelbild.webp and og.jpg written`);
