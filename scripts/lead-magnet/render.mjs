/**
 * Renders public/downloads/90-tage-ki-fahrplan.pdf from fahrplan.html + fahrplan.css.
 *
 * fahrplan.html is the source of the PDF from now on. Its text was extracted from the
 * Founder-accepted note (v0.4, planning #3093), so a text change here is a change to accepted
 * copy. Fonts come from src/fonts, inlined at render time. Run: npm run build:fahrplan
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const font = (name) =>
  `data:font/woff2;base64,${readFileSync(join(root, "src/fonts", name)).toString("base64")}`;

const css = readFileSync(join(here, "fahrplan.css"), "utf8")
  .replace("%%INTER%%", font("Inter-Variable.woff2"))
  .replace("%%GROTESK%%", font("SpaceGrotesk-Variable.woff2"));
const html = readFileSync(join(here, "fahrplan.html"), "utf8").replace(
  "<!--STYLE-->",
  `<style>${css}</style>`,
);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

// A section that outgrows its A4 page is clipped silently, so the render fails instead.
const overflowing = await page.evaluate(() =>
  [...document.querySelectorAll(".page")].flatMap((s, i) => {
    const foot = s.querySelector("footer").getBoundingClientRect().top;
    const last = Math.max(
      ...[...s.children]
        .filter((c) => !["FOOTER", "HEADER"].includes(c.tagName))
        .map((c) => c.getBoundingClientRect().bottom),
    );
    return last > foot ? [i + 1] : [];
  }),
);
if (overflowing.length > 0) {
  await browser.close();
  throw new Error(`Content runs into the footer on page(s) ${overflowing.join(", ")}`);
}

await page.pdf({
  path: join(root, "public/downloads/90-tage-ki-fahrplan.pdf"),
  preferCSSPageSize: true,
  printBackground: true,
  tagged: true,
});
await browser.close();
