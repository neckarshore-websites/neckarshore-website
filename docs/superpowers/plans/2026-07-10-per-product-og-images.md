# Per-Product OG Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shared `/og-image.jpg` on the 11 indexable product pages with a per-product social-preview card.

**Architecture:** Reuse the existing `scripts/generate-og-image.mjs` + `scripts/og-cards.config.mjs` pipeline (add 11 data entries → `public/og/<slug>.jpg`). Thread an optional `image` through the two metadata functions (`pageMetadata` in `src/lib/seo.ts` and its forwarder `productDetailMetadata` in `src/components/ProductDetailPage.tsx`) via a small `productOgImage(slug)` helper. Backward-compatible: absent `image` → current shared OG image.

**Tech Stack:** Next.js 15 App Router, TypeScript, Playwright (both the OG renderer and the e2e suite), `node --import tsx --test` for unit tests.

## Global Constraints

- Card dimensions **1200 × 630**, padding **72**, `maxKB: 200`, `dest: public/og/<slug>.jpg` — one entry per indexable product.
- **11 indexable products only:** `omnopsis`, `clearpath`, `snakeoil-check`, `phonesis`, `local-seo-hub`, `prod-or-pretend`, `trustscope`, `obsidian-vault-autopilot`, `social-scrapers`, `imap-mailbox-cleanup`, `ai-phrase-check`. EXCLUDE `restaurant-menu-update` (noindex), sub-portals, website case-studies.
- Card `tagline` = the product's existing `tagline` from `src/lib/portfolio.ts`, **verbatim**. No newly-invented copy.
- Chips are **descriptive only** (category/theme) — never a `"Live"` / `"In Entwicklung"` availability claim.
- Every existing `pageMetadata` caller must keep working unchanged (the `image` param is optional).
- Commit after each task. Push to `main` (repo Deploy Policy: push after every commit) unless told otherwise.
- Unit tests import from `src/` via **relative paths with the `.ts` extension** (established pattern in `tests/unit/`).

---

### Task 1: Thread an optional per-product OG image through the metadata layer

**Files:**
- Modify: `src/lib/seo.ts` (add optional `image` param to `pageMetadata`)
- Create: `src/lib/product-og.ts` (`productOgImage(slug)` helper)
- Modify: `src/components/ProductDetailPage.tsx:45-66` (forward a per-slug image inside `productDetailMetadata`)
- Create: `tests/unit/product-og.test.mjs`
- Modify: `package.json` (add the new test file to the `test:unit` script)

**Interfaces:**
- Produces: `pageMetadata({ …, image? })` where `image?: { url: string; width: number; height: number; alt: string }`.
- Produces: `productOgImage(slug: string): { url: string; width: number; height: number; alt: string }` returning `{ url: "/og/<slug>.jpg", width: 1200, height: 630, alt: "<name> — neckarshore.ai" }`.
- Consumes: `getItemBySlug(slug)` from `@/lib/portfolio` (exported, in-memory, no fs).

- [ ] **Step 1: Write the failing unit test**

Create `tests/unit/product-og.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { productOgImage } from "../../src/lib/product-og.ts";
import { pageMetadata } from "../../src/lib/seo.ts";

test("productOgImage returns per-slug card meta with the product name in alt", () => {
  const img = productOgImage("clearpath");
  assert.equal(img.url, "/og/clearpath.jpg");
  assert.equal(img.width, 1200);
  assert.equal(img.height, 630);
  assert.match(img.alt, /ClearPath/);
});

test("pageMetadata uses the per-product image when passed", () => {
  const meta = pageMetadata({
    title: "t", description: "d", path: "/products/clearpath",
    image: productOgImage("clearpath"),
  });
  assert.equal(meta.openGraph.images[0].url, "/og/clearpath.jpg");
  assert.equal(meta.twitter.images[0], "/og/clearpath.jpg");
});

test("pageMetadata falls back to the shared OG image when no image is passed", () => {
  const meta = pageMetadata({ title: "t", description: "d", path: "/impressum" });
  assert.match(meta.openGraph.images[0].url, /og-image/);
  assert.match(meta.twitter.images[0], /og-image/);
});
```

- [ ] **Step 2: Add the file to the test script + run to verify it fails**

In `package.json`, append `tests/unit/product-og.test.mjs` to the `test:unit` script's file list.

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '../../src/lib/product-og.ts'` (helper not created yet).

- [ ] **Step 3: Create the helper**

Create `src/lib/product-og.ts`:

```ts
import { getItemBySlug } from "@/lib/portfolio";

/** Per-product OG/social card image (1200x630) served from public/og/<slug>.jpg. */
export function productOgImage(slug: string): {
  url: string;
  width: number;
  height: number;
  alt: string;
} {
  const name = getItemBySlug(slug)?.name ?? slug;
  return {
    url: `/og/${slug}.jpg`,
    width: 1200,
    height: 630,
    alt: `${name} — neckarshore.ai`,
  };
}
```

- [ ] **Step 4: Add the optional `image` param to `pageMetadata`**

In `src/lib/seo.ts`, extend the param object and use `image ?? OG_IMAGE`:

```ts
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  image,
}: {
  title: string;
  description: string;
  /** Absolute path beginning with `/`, e.g. `/products/clearpath`. */
  path: string;
  type?: "website" | "article";
  /** Per-page OG/social image. Falls back to the shared site OG when omitted. */
  image?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  const url = `${BASE_URL}${path}`;
  const og = image ?? OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "neckarshore.ai",
      locale: "de_DE",
      type,
      images: [og],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og.url],
    },
  };
}
```

- [ ] **Step 5: Run the unit test to verify it passes**

Run: `npm run test:unit`
Expected: PASS (all three new tests green; existing unit tests still green).

- [ ] **Step 6: Forward a per-slug image inside `productDetailMetadata`**

In `src/components/ProductDetailPage.tsx`, import the helper and pass `image` into the inner `pageMetadata` call (covers the 5 wrapper pages automatically — they already pass `slug`):

```ts
import { productOgImage } from "@/lib/product-og";
// …
return {
  ...pageMetadata({
    title,
    description: entry.metaDescription ?? entry.definition,
    path: `/products/${slug}`,
    image: productOgImage(slug),
  }),
  robots: { index: !noindex, follow: true },
};
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo.ts src/lib/product-og.ts src/components/ProductDetailPage.tsx tests/unit/product-og.test.mjs package.json
git commit -m "feat(og): optional per-product OG image param + productOgImage helper"
```

---

### Task 2: Add the 11 card configs + generate the images

**Files:**
- Modify: `scripts/og-cards.config.mjs` (append 11 product-card entries)
- Create (generated): `public/og/<slug>.jpg` × 11

**Interfaces:**
- Consumes: the card contract in `scripts/generate-og-image.mjs` — `{ label, dest, width, height, padding, maxKB?, headline, headlineAccent?, tagline, chips }`.

- [ ] **Step 1: Append the 11 product cards**

Append to the `cards` array in `scripts/og-cards.config.mjs` (a `// ─── Product OG cards (public/og/<slug>.jpg) ───` section). Taglines are copied verbatim from `src/lib/portfolio.ts`. Example entries (all 11 follow this shape):

```js
{
  label: "Product OG — omnopsis",
  dest: "public/og/omnopsis.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Omnopsis", headlineAccent: "Documentor+X.",
  tagline: "KI-first Documentation Engine für Engineering-Teams — fail-closed, BYOLLM, DSGVO-by-Design.",
  chips: [
    { text: "KI-first", variant: "dot" },
    { text: "BYOLLM", variant: "plain" },
    { text: "DSGVO-by-Design", variant: "accent" },
  ],
},
{
  label: "Product OG — clearpath",
  dest: "public/og/clearpath.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "ClearPath.", headlineAccent: undefined,
  tagline: "Eine mentale Firewall gegen kognitive Verzerrungen.",
  chips: [
    { text: "Decision Support", variant: "dot" },
    { text: "Web-App", variant: "plain" },
    { text: "DSGVO", variant: "accent" },
  ],
},
{
  label: "Product OG — snakeoil-check",
  dest: "public/og/snakeoil-check.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Snakeoil", headlineAccent: "Check.",
  tagline: "Neutraler KI-Reality-Check für Online-Coachings und High-Ticket-Angebote.",
  chips: [
    { text: "KI-Reality-Check", variant: "dot" },
    { text: "Neutral", variant: "plain" },
    { text: "Made in Germany", variant: "accent" },
  ],
},
{
  label: "Product OG — phonesis",
  dest: "public/og/phonesis.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Phonesis", headlineAccent: "Voicebank.",
  tagline: "Ein Archiv echter menschlicher Stimmen für den deutschen Markt.",
  chips: [
    { text: "Voice Archive", variant: "dot" },
    { text: "Human Voices", variant: "plain" },
    { text: "Made in Germany", variant: "accent" },
  ],
},
{
  label: "Product OG — local-seo-hub",
  dest: "public/og/local-seo-hub.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Local-SEO", headlineAccent: "Hub.",
  tagline: "AI-first Sichtbarkeits-Plattform für lokale Unternehmen — Rankings, Reviews, Citations in einem Score.",
  chips: [
    { text: "Local SEO", variant: "dot" },
    { text: "AI-first", variant: "plain" },
    { text: "DSGVO", variant: "accent" },
  ],
},
{
  label: "Product OG — prod-or-pretend",
  dest: "public/og/prod-or-pretend.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Prod or", headlineAccent: "Pretend.",
  tagline: "Ein Qualitäts-Spiegel für Tech-Hype — prüft „an-einem-Wochenende-gebaut\"-Claims gegen echte Produktionsstandards.",
  chips: [
    { text: "Quality Mirror", variant: "dot" },
    { text: "Tech-Hype-Check", variant: "plain" },
    { text: "Open Standards", variant: "accent" },
  ],
},
{
  label: "Product OG — trustscope",
  dest: "public/og/trustscope.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Trust", headlineAccent: "Scope.",
  tagline: "Deterministischer Vier-Säulen-Trust-Report für öffentliche GitHub-Repos — Sicherheit, Governance, Community.",
  chips: [
    { text: "Trust Report", variant: "dot" },
    { text: "GitHub", variant: "plain" },
    { text: "MIT / Open Source", variant: "accent" },
  ],
},
{
  label: "Product OG — obsidian-vault-autopilot",
  dest: "public/og/obsidian-vault-autopilot.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Obsidian Vault", headlineAccent: "Autopilot.",
  tagline: "Open-Source-Automatisierung für Wissens-Vaults in Obsidian — sortiert, benennt, taggt und reichert Notizen an.",
  chips: [
    { text: "Claude Skill", variant: "dot" },
    { text: "Obsidian", variant: "plain" },
    { text: "Open Source", variant: "accent" },
  ],
},
{
  label: "Product OG — social-scrapers",
  dest: "public/og/social-scrapers.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Social", headlineAccent: "Scrapers.",
  tagline: "Obsidian-Skills für Instagram-, LinkedIn- und X-Profile — neutrale Markdown-Briefings statt Engagement-Bait.",
  chips: [
    { text: "Obsidian Skills", variant: "dot" },
    { text: "Apify + X API", variant: "plain" },
    { text: "Markdown", variant: "accent" },
  ],
},
{
  label: "Product OG — imap-mailbox-cleanup",
  dest: "public/og/imap-mailbox-cleanup.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "Mailbox Triage.", headlineAccent: "Dry-run first.",
  tagline: "Hybrid CLI + Claude-Skill für IONOS-IMAP-Postfach-Triage — dry-run by default, audit-logged.",
  chips: [
    { text: "CLI + Claude Skill", variant: "dot" },
    { text: "Dry-run", variant: "plain" },
    { text: "MIT / Open Source", variant: "accent" },
  ],
},
{
  label: "Product OG — ai-phrase-check",
  dest: "public/og/ai-phrase-check.jpg",
  width: 1200, height: 630, padding: 72, maxKB: 200,
  headline: "AI Phrase", headlineAccent: "Check.",
  tagline: "Erkennt KI-typische Floskeln in deutschem und englischem Text.",
  chips: [
    { text: "Claude Skill", variant: "dot" },
    { text: "DE + EN", variant: "plain" },
    { text: "MIT / Open Source", variant: "accent" },
  ],
},
```

- [ ] **Step 2: Generate the images**

Run: `node scripts/generate-og-image.mjs`
Expected: 11 new `[OK]` lines for `public/og/*.jpg`, each ≤ 200 KB. If any prints `[OVER]`, shorten that card's tagline (the portfolio tagline is the source of truth — flag it for a Founder copy-trim rather than inventing new text).

- [ ] **Step 3: Visually spot-check the output**

Open 2-3 of `public/og/*.jpg` (e.g. omnopsis, imap-mailbox-cleanup, ai-phrase-check) and confirm the headline fits on ≤ 2 lines, tagline is not clipped, chips render. (Founder visual-accept is the DoD gate — this step is a sanity check, not acceptance.)

- [ ] **Step 4: Commit**

```bash
git add scripts/og-cards.config.mjs public/og/
git commit -m "feat(og): 11 per-product social-preview cards (public/og/<slug>.jpg)"
```

---

### Task 3: Wire the 6 direct pages + assert the per-product invariant

**Files:**
- Modify: `src/app/products/clearpath/page.tsx`, `.../omnopsis/page.tsx`, `.../ai-phrase-check/page.tsx`, `.../imap-mailbox-cleanup/page.tsx`, `.../obsidian-vault-autopilot/page.tsx`, `.../social-scrapers/page.tsx` (add `image: productOgImage("<slug>")` to their `pageMetadata` call)
- Modify: `tests/e2e/seo.spec.ts` (new `TC-SEO-*` per-product og:image test)
- Modify: `docs/manual-tests.md` (new `TC-MAN-OG-*` visual-preview entry)

**Interfaces:**
- Consumes: `productOgImage(slug)` from Task 1, `public/og/<slug>.jpg` from Task 2.

- [ ] **Step 1: Write the failing e2e test**

Add to `tests/e2e/seo.spec.ts` (after the `OG_DRIFT_TESTS` block):

```ts
const PRODUCT_OG_SLUGS = [
  "omnopsis", "clearpath", "snakeoil-check", "phonesis", "local-seo-hub",
  "prod-or-pretend", "trustscope", "obsidian-vault-autopilot",
  "social-scrapers", "imap-mailbox-cleanup", "ai-phrase-check",
];

for (const [i, slug] of PRODUCT_OG_SLUGS.entries()) {
  test(`TC-SEO-0${43 + i}: /products/${slug} has its own per-product og:image`, async ({ page }) => {
    const res = await page.goto(`/products/${slug}`);
    expect(res?.status()).toBeLessThan(400);
    const expected = new RegExp(`/og/${slug}\\.jpg`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", expected);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", expected);
    // asset resolves
    const asset = await page.request.get(`/og/${slug}.jpg`);
    expect(asset.status()).toBe(200);
  });
}
```

> **Note:** `TC-SEO-042` is the current last SEO id (per `docs/test-log.md`); this block claims `TC-SEO-043`..`053`. Verify the next-free id before running and adjust the `43 +` offset if the suite has grown.

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:e2e -- --grep "TC-SEO-04|TC-SEO-05"` (dev server must be built/running per the repo's e2e setup, or use `npm run test:e2e`).
Expected: FAIL — the 5 wrapper pages already pass (Task 1 wired `productDetailMetadata`), but the 6 direct pages still emit `/og-image.jpg`.

- [ ] **Step 3: Wire the 6 direct pages**

In each of the 6 direct pages, import the helper and add `image` to the `pageMetadata(...)` call. Example (`src/app/products/clearpath/page.tsx`):

```ts
import { productOgImage } from "@/lib/product-og";
// inside generateMetadata / metadata:
return pageMetadata({
  title: /* unchanged */,
  description: /* unchanged */,
  path: "/products/clearpath",
  image: productOgImage("clearpath"),
});
```

For the `export const metadata = pageMetadata({...})` pages (`ai-phrase-check`, `imap-mailbox-cleanup`, `obsidian-vault-autopilot`, `omnopsis`, `social-scrapers`), add the same `image: productOgImage("<slug>")` line with each page's own slug.

- [ ] **Step 4: Run the e2e test to verify it passes**

Run: `npm run test:e2e -- --grep "TC-SEO-04|TC-SEO-05"`
Expected: PASS (all 11 product pages emit `/og/<slug>.jpg` for both og:image and twitter:image; each asset resolves 200).

- [ ] **Step 5: Full e2e + lint regression**

Run: `npm run test:e2e:ci` then `npm run lint`
Expected: PASS — no regression; `/impressum` + `/datenschutz` still carry the shared `/og-image.jpg` (their `TC-SEO-013/014` unchanged).

- [ ] **Step 6: Add the manual-test entry + log**

Add a `TC-MAN-OG-*` row to `docs/manual-tests.md` for the visual preview pass (LinkedIn Post Inspector / Slack unfurl on 2-3 product URLs). Log the e2e run in `docs/test-log.md`.

- [ ] **Step 7: Commit**

```bash
git add src/app/products/*/page.tsx tests/e2e/seo.spec.ts docs/manual-tests.md docs/test-log.md
git commit -m "feat(og): wire per-product OG images on the 6 direct product pages + e2e invariant (TC-SEO-043..053)"
```

---

## Self-Review

**Spec coverage:**
- 11 indexable set → Task 2 configs + Task 3 wiring/e2e loop (all 11 listed). ✅
- Exclusions (restaurant-menu noindex, sub-portals, websites) → not added anywhere. ✅
- Reuse pipeline, 1200×630, public/og/<slug>.jpg → Task 2. ✅
- Verbatim taglines → Task 2 entries (copied from portfolio.ts). ✅
- Descriptive chips, no status → Task 2 chips (no "Live"/"In Entwicklung"). ✅
- Backward-compatible pageMetadata + one wiring point (+ forwarder) → Task 1. ✅
- 5 bespoke pages covered → Task 1 Step 6 (productDetailMetadata derives from slug). ✅
- +1 per-product og:image e2e → Task 3. ✅
- Manual OG preview + Founder visual-accept DoD → Task 3 Step 6 + noted as the gate. ✅

**Type consistency:** `image` object shape `{ url, width, height, alt }` is identical in `productOgImage` (Task 1 Step 3), the `pageMetadata` param (Task 1 Step 4), and the forwarder (Task 1 Step 6). ✅

**Placeholder scan:** the only deferred value is the exact `TC-SEO` id offset (flagged with a verify-note in Task 3 Step 1) — every code block is concrete. ✅
