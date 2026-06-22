# Products Indexing + GEO Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 4 MMP preview pages indexable + GEO-discoverable while keeping their structured data honest (pre-launch: no `url`/`offers`), and remove the dual-gate noindex footgun.

**Architecture:** `noindex` in `src/lib/portfolio.ts` becomes the single source for robots-meta, sitemap inclusion, and FAQPage-schema activation. Dropping the flag on the 4 previews flips all three automatically. Plus targeted GEO copy (question-shaped H2s) and crawler-discovery config (llms.txt, robots.txt).

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind, Playwright e2e, markdown content-collection.

**Spec:** `docs/superpowers/specs/2026-06-22-products-indexing-geo-pass-design.md`

**Branch:** `linus/products-indexing-geo` (already created; spec already committed there).

## Global Constraints

- Every Bash command starts with `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && …` (harness resets cwd per call).
- JSON-LD only via the native-`<script>` `<JsonLd>` helper — NEVER `next/script` (AD-19).
- Preview MMP `SoftwareApplication` schema stays `previewSoftwareApplicationSchema` — NO `url`, NO `offers` (fail-closed; AD-19). TC-CNT-037/040/043/046 lock this and must stay green.
- `restaurant-menu-update` KEEPS `noindex: true` (private, genericized client skill) — do not touch it.
- Copy discipline: "weniger ist mehr" — no passage padding; this pass only converts heading wording.
- Dependencies: exact versions only (no `^`/`~`) — no new deps in this plan.
- `npm run test:e2e` = `playwright test`; target a subset with `npm run test:e2e -- --grep "<pattern>"`. The Playwright config auto-starts the dev server.

---

### Task 1: Index the 4 MMP previews (single-source robots + noindex drop)

**Files:**
- Modify: `src/components/PreviewProductPage.tsx` (the `previewProductMetadata` function)
- Modify: `src/lib/portfolio.ts` (remove `noindex: true` from 4 items)
- Test: `tests/e2e/content-surface.spec.ts` (TC-CNT-055/056 FAQ arrays)

**Interfaces:**
- Consumes: `getItemBySlug(slug)` from `@/lib/portfolio` (returns `PortfolioItem | undefined`; `item.noindex?: boolean`).
- Produces: the 4 routes `/products/{snakeoil-check,phonesis,local-seo-hub,prod-or-pretend}` now emit `robots: index`, enter the sitemap, and render a `FAQPage` JSON-LD block.

- [ ] **Step 1: Move the 4 slugs from `FAQ_NOINDEX` to `FAQ_INDEXABLE` in the test**

In `tests/e2e/content-surface.spec.ts`, the `FAQ_INDEXABLE` array gains the 4 slugs and `FAQ_NOINDEX` keeps only the private skill:

```ts
  const FAQ_INDEXABLE = [
    "/products/omnopsis",
    "/products/clearpath",
    "/products/snakeoil-check",
    "/products/phonesis",
    "/products/local-seo-hub",
    "/products/prod-or-pretend",
    "/products/social-scrapers",
    "/products/imap-mailbox-cleanup",
    "/products/websites/neckarshore",
    "/products/websites/ristorante-goldoni",
    "/products/websites/oakwood-golf-club",
    "/products/websites/rauhut",
  ] as const;

  // noindex pages: the private restaurant skill only — visible FAQ, NO FAQPage schema.
  const FAQ_NOINDEX = ["/products/restaurant-menu-update"] as const;
```

- [ ] **Step 2: Run the FAQ-gate tests to verify they now fail**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-CNT-055|TC-CNT-056"`
Expected: FAIL — the 4 previews are still `noindex`, so TC-CNT-055 finds 0 FAQPage blocks where it now expects 1.

- [ ] **Step 3: Refactor `previewProductMetadata` to derive robots from the portfolio flag**

In `src/components/PreviewProductPage.tsx`, add the import and rewrite the function:

```ts
import { breadcrumbTrailForSlug, getItemBySlug } from "@/lib/portfolio";
```

```ts
export function previewProductMetadata({
  slug,
  title,
}: {
  slug: string;
  title: string;
}): Metadata {
  const entry = getProductEntry(slug);
  if (!entry) return {};
  const item = getItemBySlug(slug);
  const noindex = item?.noindex ?? false;
  return {
    ...pageMetadata({ title, description: entry.definition, path: `/products/${slug}` }),
    robots: { index: !noindex, follow: true },
  };
}
```

(The existing file already imports `breadcrumbTrailForSlug` from `@/lib/portfolio` — extend that import with `getItemBySlug` rather than adding a second import line.)

- [ ] **Step 4: Drop `noindex: true` on the 4 preview items in `src/lib/portfolio.ts`**

For each of `snakeoil-check`, `phonesis`, `local-seo-hub`, `prod-or-pretend`: delete the `noindex: true,` line and remove the now-inaccurate "Stays noindex (held out of the sitemap) until the public app launches" clause from the trailing comment (keep the rest of each comment). Do NOT touch `restaurant-menu-update` (keeps `noindex: true`). Leave `hasOwnPage: true` and the schema fields unchanged.

- [ ] **Step 5: Run the FAQ-gate tests to verify they pass**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-CNT-055|TC-CNT-056"`
Expected: PASS — the 4 previews now emit one FAQPage block; `restaurant-menu-update` still emits none.

- [ ] **Step 6: Confirm the honesty tests still pass (no schema regression)**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-CNT-037|TC-CNT-040|TC-CNT-043|TC-CNT-046"`
Expected: PASS — `url`/`offers` still undefined on all 4 (we changed robots, not schema).

- [ ] **Step 7: Commit**

```bash
cd ~/Developer/projects/neckarshore-websites/neckarshore-website && git add src/components/PreviewProductPage.tsx src/lib/portfolio.ts tests/e2e/content-surface.spec.ts && git commit -m "feat(products): index the 4 MMP previews (single-source robots from portfolio noindex)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0159MzsDKQXaStZBeCJoAeew"
```

---

### Task 2: Question-shaped H2s on the 4 MMP markdown files

**Files:**
- Modify: `src/content/products/snakeoil-check.md`
- Modify: `src/content/products/phonesis.md`
- Modify: `src/content/products/local-seo-hub.md`
- Modify: `src/content/products/prod-or-pretend.md`
- Test: `tests/e2e/content-surface.spec.ts` (TC-CNT-036/039/042/045)

**Interfaces:**
- Consumes: nothing new.
- Produces: the body H2 headings rendered on the 4 pages change (3 per page); the FAQ section heading "Häufige Fragen" and `Das Problem` / `Datenschutz & Ethik` / `Wie dieser Text entstand` are unchanged.

- [ ] **Step 1: Update the heading-assertion arrays in the test**

In `tests/e2e/content-surface.spec.ts`, replace the 3 converted strings in each per-MMP heading list:

TC-CNT-036 (snakeoil-check):
```ts
    for (const heading of [
      "Das Problem",
      "Wie funktioniert Snakeoil-Check?",
      "Was Snakeoil-Check anders macht",
      "Wann kommt Snakeoil-Check?",
      "Wie dieser Text entstand",
    ]) {
```

TC-CNT-039 (phonesis):
```ts
    for (const heading of [
      "Das Problem",
      "Wie funktioniert Phonesis?",
      "Was Phonesis anders macht",
      "Datenschutz & Ethik",
      "Wann kommt Phonesis?",
      "Wie dieser Text entstand",
    ]) {
```

TC-CNT-042 (prod-or-pretend):
```ts
    for (const heading of [
      "Das Problem",
      "Wie funktioniert Prod-or-Pretend?",
      "Was Prod-or-Pretend anders macht",
      "Wann kommt Prod-or-Pretend?",
      "Wie dieser Text entstand",
    ]) {
```

TC-CNT-045 (local-seo-hub):
```ts
    for (const heading of [
      "Das Problem",
      "Wie funktioniert Local-SEO-Hub?",
      "Was Local-SEO-Hub anders macht",
      "Wann kommt Local-SEO-Hub?",
      "Wie dieser Text entstand",
    ]) {
```

- [ ] **Step 2: Run the heading tests to verify they now fail**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-CNT-036|TC-CNT-039|TC-CNT-042|TC-CNT-045"`
Expected: FAIL — the markdown still has the old `## Wie es funktioniert` etc.

- [ ] **Step 3: Rewrite the 3 headings in each markdown file**

In each file replace exactly these 3 heading lines (leave all body text, `## Das Problem`, phonesis's `## Datenschutz & Ethik`, and `## Wie dieser Text entstand` untouched):

- `snakeoil-check.md`: `## Wie es funktioniert` → `## Wie funktioniert Snakeoil-Check?`; `## Die Idee dahinter` → `## Was Snakeoil-Check anders macht`; `## Status & Roadmap` → `## Wann kommt Snakeoil-Check?`
- `phonesis.md`: `## Wie es funktioniert` → `## Wie funktioniert Phonesis?`; `## Die Idee dahinter` → `## Was Phonesis anders macht`; `## Status & Roadmap` → `## Wann kommt Phonesis?`
- `local-seo-hub.md`: `## Wie es funktioniert` → `## Wie funktioniert Local-SEO-Hub?`; `## Die Idee dahinter` → `## Was Local-SEO-Hub anders macht`; `## Status & Roadmap` → `## Wann kommt Local-SEO-Hub?`
- `prod-or-pretend.md`: `## Wie es funktioniert` → `## Wie funktioniert Prod-or-Pretend?`; `## Die Idee dahinter` → `## Was Prod-or-Pretend anders macht`; `## Status & Roadmap` → `## Wann kommt Prod-or-Pretend?`

- [ ] **Step 4: Run the heading tests to verify they pass**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-CNT-036|TC-CNT-039|TC-CNT-042|TC-CNT-045"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/projects/neckarshore-websites/neckarshore-website && git add src/content/products tests/e2e/content-surface.spec.ts && git commit -m "feat(products): question-shaped H2s on the 4 MMP pages (GEO citability)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0159MzsDKQXaStZBeCJoAeew"
```

---

### Task 3: Crawler discovery — llms.txt Products section + robots.txt OAI-SearchBot

**Files:**
- Modify: `public/llms.txt`
- Modify: `public/robots.txt`
- Test: `tests/e2e/seo.spec.ts` (add 2 assertions)

**Interfaces:**
- Consumes: nothing.
- Produces: `llms.txt` exposes the product inventory + URLs; `robots.txt` names `OAI-SearchBot`.

- [ ] **Step 1: Add two assertions to `tests/e2e/seo.spec.ts`**

Inside the existing SEO describe block, add:

```ts
  test("TC-SEO-021: robots.txt names OAI-SearchBot", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("OAI-SearchBot");
  });

  test("TC-SEO-022: llms.txt lists the products surface", async ({ request }) => {
    const body = await (await request.get("/llms.txt")).text();
    expect(body).toContain("/products/snakeoil-check");
    expect(body.toLowerCase()).toContain("products");
  });
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-SEO-021|TC-SEO-022"`
Expected: FAIL — neither string is present yet.

- [ ] **Step 3: Add the `OAI-SearchBot` block to `public/robots.txt`**

Insert directly after the `GPTBot` block:

```
User-agent: OAI-SearchBot
Allow: /
```

- [ ] **Step 4: Add the `## Products` section to `public/llms.txt`**

Insert after the `## Flagship Product` section (before `## Services`):

```
## Products

neckarshore.ai builds across four tiers: one flagship, a handful of MMPs (Minimum Marketable Products), focused open-source skills, and client/own websites. Full tree: https://neckarshore.ai/products

### Flagship
- Omnopsis Documentor+X — AI-first documentation engine for engineering teams; fail-closed, BYOLLM, DSGVO-by-design. https://neckarshore.ai/products/omnopsis

### MMPs (Minimum Marketable Products)
- ClearPath — a mental firewall against cognitive bias. https://neckarshore.ai/products/clearpath
- Snakeoil-Check — neutral reality-check for online coaching and high-ticket offers. https://neckarshore.ai/products/snakeoil-check
- Phonesis Voicebank — an archive of real human voices for the German market. https://neckarshore.ai/products/phonesis
- Local-SEO-Hub — AI-first local visibility platform; rankings, reviews and citations in one score. https://neckarshore.ai/products/local-seo-hub
- Prod-or-Pretend — a quality mirror for tech hype; checks "built-in-a-weekend" claims against real production standards. https://neckarshore.ai/products/prod-or-pretend

### Skills (open source)
- Obsidian Vault Autopilot — automation for Obsidian knowledge vaults. https://neckarshore.ai/products/obsidian-vault-autopilot
- AI Phrase Check — detects AI-typical filler phrases in German and English text. https://neckarshore.ai/products/ai-phrase-check
- Social Scrapers — Obsidian skills for Instagram/LinkedIn/X profiles; neutral Markdown briefings. https://neckarshore.ai/products/social-scrapers
- IMAP Mailbox Cleanup — hybrid CLI + Claude skill for IMAP mailbox triage; dry-run by default. https://neckarshore.ai/products/imap-mailbox-cleanup

### Websites
- Real client and own web projects (neckarshore.ai, ristorante-goldoni.de, oakwoodgolfclub.de, rauhut.com). https://neckarshore.ai/products/websites
```

- [ ] **Step 5: Run the new tests to verify they pass**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e -- --grep "TC-SEO-021|TC-SEO-022"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/projects/neckarshore-websites/neckarshore-website && git add public/llms.txt public/robots.txt tests/e2e/seo.spec.ts && git commit -m "feat(seo): llms.txt products inventory + robots.txt OAI-SearchBot

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0159MzsDKQXaStZBeCJoAeew"
```

---

### Task 4: Full verification + PR

**Files:** none (verification + integration).

- [ ] **Step 1: Lint**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run lint`
Expected: clean, zero warnings.

- [ ] **Step 2: Build**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run build`
Expected: green build; the sitemap at build time now contains the 4 new product routes.

- [ ] **Step 3: Full e2e suite**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:e2e`
Expected: all green. Log the run in `docs/test-log.md` as `ad-hoc`.

- [ ] **Step 4: Search-index unit invariant**

Run: `cd ~/Developer/projects/neckarshore-websites/neckarshore-website && npm run test:search:unit`
Expected: PASS (every portfolio + glossar slug indexed).

- [ ] **Step 5: Push + open PR**

```bash
cd ~/Developer/projects/neckarshore-websites/neckarshore-website && git push -u origin linus/products-indexing-geo && gh pr create --title "feat(products): index the 4 MMP previews + must-fix GEO (Scope A)" --body "$(cat <<'BODY'
Implements docs/superpowers/specs/2026-06-22-products-indexing-geo-pass-design.md.

- Single-source robots: previewProductMetadata derives robots from portfolio noindex.
- Drop noindex on snakeoil-check/phonesis/local-seo-hub/prod-or-pretend → sitemap +4, FAQPage activates. restaurant-menu-update stays noindex.
- Question-shaped H2s on the 4 MMP pages (GEO citability).
- llms.txt products inventory + robots.txt OAI-SearchBot.
- Schema unchanged (preview: no url/offers) — honesty tests stay green.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
BODY
)"
```

- [ ] **Step 6: Post-merge R2 live verification (after Vercel deploy)**

```bash
cd ~/Developer/projects/neckarshore-websites/neckarshore-website
curl -s https://neckarshore.ai/sitemap.xml | grep -c -E "products/(snakeoil-check|phonesis|local-seo-hub|prod-or-pretend)"   # expect 4
curl -s https://neckarshore.ai/products/snakeoil-check | grep -o '<meta name="robots"[^>]*>'   # expect index, follow
curl -s https://neckarshore.ai/products/snakeoil-check | grep -c 'FAQPage'   # expect >= 1
curl -s https://neckarshore.ai/robots.txt | grep -c 'OAI-SearchBot'   # expect 1
```
Expected: 4 sitemap hits, robots=index, FAQPage present, OAI-SearchBot present. Visual acceptance stays the user's call.

---

## Self-Review

**Spec coverage:** Change 1 (dual-gate) → Task 1 Step 3. Change 2 (noindex drop) → Task 1 Step 4. Change 3 (llms.txt) → Task 3 Step 4. Change 4 (robots.txt) → Task 3 Step 3. Change 5 (H2s) → Task 2. Change 6 (tests) → Tasks 1/2/3 test steps. DoD (lint/build/e2e/search-unit/PR/R2) → Task 4. All spec sections covered.

**Placeholder scan:** No TBD/TODO; every code + command step shows exact content.

**Type consistency:** `getItemBySlug` returns `PortfolioItem | undefined`; `item?.noindex ?? false` matches the optional `noindex?: boolean` field. Test array names (`FAQ_INDEXABLE`/`FAQ_NOINDEX`) match the existing test source. Heading strings in Task 2 tests match the markdown edits exactly.

**Out-of-scope honored:** schema untouched (no url/offers added), no passage padding, restaurant-menu-update untouched — consistent with the spec's out-of-scope list.
