# Perspektiven Article Surface — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/perspektiven` thought-leadership article surface on neckarshore.ai — a new content collection, index + detail routes, BlogPosting/FAQPage schema, and full integration (Nav, sitemap, Cmd+K search, llms.txt) — so the site has a citable, indexable GEO content surface.

**Architecture:** Mirror the existing `products`/`websites` content-collection pattern. A pure `authors.ts` identity module + a `src/content/perspektiven/*.md` markdown collection feed a typed `articles.ts` loader. Server-Component routes render SSR HTML; a new `article.ts` schema factory emits `BlogPosting` JSON-LD with a per-article Person/Organization author switch. The 4 launch articles ship as structural drafts (real frontmatter, skeleton bodies) for the Founder/Gary to expand in the downstream content phase.

**Tech Stack:** Next.js 15 (App Router, Server Components), TypeScript, Tailwind, gray-matter (frontmatter), Playwright (e2e), `tsx`/`node:test` (unit).

## Global Constraints

Every task's requirements implicitly include these:

- **JSON-LD only via the native `<script type="application/ld+json">` `<JsonLd>` component — NEVER `next/script`** (AD-19; the crawler must see schema in the raw SSR HTML).
- **All routes are Server Components** (no `"use client"` on the page files) so schema + content ship in SSR HTML.
- **Code/identifiers in English; article copy + UI labels in German.**
- **No new dependencies.** Everything reuses existing libs.
- **Author fallback is fail-safe:** an unknown `author` value resolves to the neckarshore Organization, never throws.
- **FAQ is mandatory for the 4 MVP articles**; the `faq` field is optional in the model.
- **Articles are indexable** (no `noindex`); `<ProductFaq>` is called with `indexable={true}` (there is no portfolio item to derive the flag from).
- **Lighthouse:** a11y / best-practices / SEO are hard @95 on all profiles; performance is soft-warn (never blocks).
- **Test IDs:** new e2e suite suffix `PSP` (`TC-PSP-NNN`). Grep the WHOLE `tests/` dir before assigning an ID — the `TC-[SUITE]-[NNN]` namespace spans e2e + unit files.
- **Do NOT merge to `main` / push to prod** until the Founder approves the copy. All work stays on branch `linus/perspektiven-surface`.

---

## File Structure

| Path | Responsibility | Task |
|------|----------------|------|
| `src/lib/authors.ts` | Pure author-identity map (id → name/role/bio/url/sameAs) + `getAuthor` fail-safe lookup | 1 |
| `src/content/perspektiven/*.md` | The 4 article markdown files (frontmatter + draft body) | 1 |
| `src/lib/content/articles.ts` | Typed loader: `getArticle`, `getAllArticles`, `allArticleRoutes` | 1 |
| `src/lib/schema/article.ts` | `blogPostingSchema` factory (Person/Org author switch) | 2 |
| `src/components/ArticleByline.tsx` | Author name + formatted date row | 3 |
| `src/components/AuthorBio.tsx` | End-of-article author authority block | 3 |
| `src/app/perspektiven/[slug]/page.tsx` | Article detail route | 3 |
| `src/components/ArticleCard.tsx` | Index list card | 4 |
| `src/app/perspektiven/page.tsx` | Index hub route | 4 |
| `src/components/Nav.tsx` | Add the top-level Perspektiven link | 5 |
| `src/app/sitemap.ts` | Add the article routes | 6 |
| `src/lib/search/index-data.ts` | Add articles to the Cmd+K index | 7 |
| `public/llms.txt` | Add the Perspektiven section | 8 |
| `src/lib/site-config.ts` | Bump `SITE_UPDATED` | 9 |

---

## Task 1: Author identity + article content collection + loader

**Files:**
- Create: `src/lib/authors.ts`
- Create: `src/content/perspektiven/nearshore-vs-offshore.md`
- Create: `src/content/perspektiven/ki-beschleunigte-entwicklung.md`
- Create: `src/content/perspektiven/dsgvo-by-design.md`
- Create: `src/content/perspektiven/entscheidungsqualitaet-cto.md`
- Create: `src/lib/content/articles.ts`
- Create: `tests/unit/articles.test.ts`
- Modify: `package.json` (add the new test file to the `test:unit` script)

**Interfaces:**
- Produces: `AuthorId = "german-rauhut" | "neckarshore"`; `getAuthor(id: string): Author`; `Article` (frontmatter + `slug` + `bodyHtml`); `getArticle(slug: string): Article | null`; `getAllArticles(): Article[]` (sorted `published` desc); `allArticleRoutes(): string[]`.

- [ ] **Step 1: Write `src/lib/authors.ts`** (pure, no fs — safe for client + schema + components)

```ts
export type AuthorId = "german-rauhut" | "neckarshore";

export interface Author {
  id: AuthorId;
  /** Byline display name. */
  name: string;
  /** Short role line under the name. */
  role: string;
  /** End-of-article bio (1–2 sentences, real credentials). */
  bio: string;
  url: string;
  /** Person/Org sameAs profiles for schema. */
  sameAs?: string[];
}

export const AUTHORS: Record<AuthorId, Author> = {
  "german-rauhut": {
    id: "german-rauhut",
    name: "German Rauhut",
    role: "Gründer, neckarshore.ai",
    bio: "Gründer von neckarshore.ai in Stuttgart. Zuvor IT bei Mercedes-Benz; heute Nearshore-Softwareentwicklung mit KI-Beschleunigung für den DACH-Mittelstand.",
    url: "https://neckarshore.ai/",
    sameAs: ["https://www.linkedin.com/in/german-rauhut/", "https://github.com/GmanFooFoo"],
  },
  neckarshore: {
    id: "neckarshore",
    name: "neckarshore.ai",
    role: "Nearshore-Softwareentwicklung aus Stuttgart",
    bio: "neckarshore.ai baut KI-beschleunigte Software für den DACH-Mittelstand — gleiche Zeitzone, gleiche Sprache, DSGVO-by-Design.",
    url: "https://neckarshore.ai/",
  },
};

/** Fail-safe: an unknown author id resolves to the neckarshore Organization. */
export function getAuthor(id: string): Author {
  return AUTHORS[id as AuthorId] ?? AUTHORS.neckarshore;
}
```

- [ ] **Step 2: Write the 4 article markdown files (real frontmatter + draft skeleton body)**

The bodies are explicit v0 drafts — the Founder/Gary expand the prose downstream. Each follows the citable anatomy: question-shaped H2s, answer-in-sentence-1. Lead lives in frontmatter (rendered separately), so the body starts at the first H2.

`src/content/perspektiven/nearshore-vs-offshore.md`:

```markdown
---
title: "Nearshore in Deutschland vs. Offshore: Was CTOs wirklich abwägen sollten"
lead: "Nearshore-Entwicklung in Deutschland und Offshore unterscheiden sich nicht primär im Tagessatz, sondern in den verdeckten Kosten: Zeitzone, Sprache, Datenschutz-Haftung und Kommunikations-Overhead. Wer nur den Stundensatz vergleicht, rechnet die teuerste Position heraus."
author: "german-rauhut"
published: "2026-06-24"
topic: "nearshore"
faq:
  - q: "Was ist der Unterschied zwischen Nearshore und Offshore?"
    a: "Nearshore meint Entwicklung in geografischer und kultureller Nähe (gleiche Zeitzone, gleiche Sprache, gleicher Rechtsraum); Offshore meint weit entfernte Standorte mit Zeitzonen- und Sprachdistanz."
  - q: "Ist Nearshore teurer als Offshore?"
    a: "Im Tagessatz oft ja, in den Gesamtkosten häufig nein — Offshore-Overhead (Abstimmung, Nacharbeit, Zeitverzug) verschiebt die Total-Cost-of-Ownership."
  - q: "Wie wirkt sich der Standort auf den Datenschutz aus?"
    a: "Entwicklung innerhalb der EU unterliegt der DSGVO direkt; bei Drittland-Standorten braucht es zusätzliche Garantien für den Datentransfer."
---

## Was kostet Offshore wirklich?

<!-- DRAFT: Founder/Gary expand. Answer in sentence 1, then elaborate. -->
Der Tagessatz ist nur die sichtbare Spitze. Abstimmungs-Overhead, Nacharbeit und Zeitverzug verschieben die echten Kosten.

## Warum Zeitzone und Sprache mehr wiegen als der Stundensatz

<!-- DRAFT -->
Gleiche Arbeitszeiten und eine gemeinsame Sprache senken den Kommunikations-Overhead, der bei verteilten Teams die Geschwindigkeit frisst.

## Was bedeutet Daten-Residenz für die Partnerwahl?

<!-- DRAFT -->
Wo der Code und die Daten liegen, entscheidet über die DSGVO-Haftung — eine Architektur-Frage, keine Vertrags-Fußnote.
```

`src/content/perspektiven/ki-beschleunigte-entwicklung.md`:

```markdown
---
title: "KI-beschleunigte Softwareentwicklung: Was sich real ändert — und was Hype bleibt"
lead: "KI beschleunigt Softwareentwicklung dort messbar, wo Kontext reproduzierbar ist: Boilerplate, Tests, Dokumentation, Refactoring. Sie ersetzt nicht das Architektur-Urteil — und ein 'an-einem-Wochenende-gebaut'-Prototyp ist kein Produktionssystem."
author: "german-rauhut"
published: "2026-06-23"
topic: "ki-entwicklung"
faq:
  - q: "Wo beschleunigt KI die Softwareentwicklung wirklich?"
    a: "Bei reproduzierbaren, kontextreichen Aufgaben — Boilerplate, Tests, Dokumentation, Refactoring — nicht beim grundlegenden Architektur-Urteil."
  - q: "Ersetzt KI Entwickler?"
    a: "Nein. KI verschiebt den Hebel von Tippgeschwindigkeit zu Urteilsqualität; die Verantwortung für Korrektheit und Sicherheit bleibt menschlich."
  - q: "Ist ein KI-Prototyp produktionsreif?"
    a: "Selten. Produktionsreife verlangt Tests, Sicherheit, Fehlerbehandlung und Betrieb — Standards, die ein schneller Prototyp meist überspringt."
---

## Wo beschleunigt KI messbar — und wo nicht?

<!-- DRAFT -->
KI liefert dort, wo Kontext reproduzierbar ist. Beim Architektur-Urteil unter Unsicherheit bleibt der Mensch der Engpass.

## Warum „fail-closed" der richtige Default ist

<!-- DRAFT -->
Lieber schweigen als halluzinieren: Ein System, das im Zweifel nichts behauptet, ist vertrauenswürdiger als eines, das plausibel falsch liegt.

## Wie unterscheidet man Produkt von Prototyp?

<!-- DRAFT -->
An den unsichtbaren Standards — Tests, Sicherheit, Betrieb — nicht an der Demo.
```

`src/content/perspektiven/dsgvo-by-design.md`:

```markdown
---
title: "DSGVO-by-Design: Datenschutz als Architektur-Entscheidung, nicht als Checkbox"
lead: "DSGVO-by-Design heißt, Datenschutz in die Architektur zu bauen, statt ihn nachträglich zu dokumentieren: Daten-Residenz, Datensparsamkeit und Zugriffsgrenzen als Entwurfsprinzip. Eine nachgelagerte Checkbox erzeugt Papier, keine Konformität."
author: "neckarshore"
published: "2026-06-22"
topic: "dsgvo"
faq:
  - q: "Was bedeutet DSGVO-by-Design konkret?"
    a: "Datenschutz wird zum Architektur-Prinzip: Daten-Residenz, Datensparsamkeit und Zugriffsgrenzen werden vor der Implementierung entworfen, nicht danach dokumentiert."
  - q: "Reicht eine Datenschutzerklärung für DSGVO-Konformität?"
    a: "Nein. Die Erklärung beschreibt nur; Konformität entsteht in der technischen Umsetzung — wo Daten liegen, wer zugreift, was minimiert wird."
  - q: "Was ist BYOLLM und warum ist es datenschutzrelevant?"
    a: "Bring Your Own LLM lässt Kunden das Sprachmodell selbst wählen, sodass sensible Daten den kontrollierten Rahmen nicht verlassen."
---

## Warum eine Checkbox keinen Datenschutz erzeugt

<!-- DRAFT -->
Nachträgliche Dokumentation beschreibt einen Zustand; sie verändert ihn nicht. Konformität entsteht im Entwurf.

## Welche Praktiken machen DSGVO-by-Design real?

<!-- DRAFT -->
Daten-Residenz in der EU, Datensparsamkeit, BYOLLM, kein US-Transfer, cookieless Analytics — Entscheidungen, die in der Architektur sichtbar sind.

## Wie prüft ein CTO das beim Partner?

<!-- DRAFT -->
An nachweisbaren Defaults, nicht an Versprechen — wo liegen die Daten, was wird minimiert, was verlässt das Haus?
```

`src/content/perspektiven/entscheidungsqualitaet-cto.md`:

```markdown
---
title: "Entscheidungsqualität in der Tech-Führung: Bessere Architektur-Entscheidungen unter Unsicherheit"
lead: "Architektur-Entscheidungen scheitern selten an fehlendem Wissen, sondern an kognitiven Verzerrungen unter Unsicherheit: Sunk-Cost, Bestätigungsfehler, Hype-getriebene Mehrheitsmeinung. Entscheidungsqualität ist trainierbar — durch Struktur, nicht durch mehr Daten."
author: "german-rauhut"
published: "2026-06-21"
topic: "entscheidungsqualitaet"
faq:
  - q: "Warum treffen erfahrene CTOs schlechte Architektur-Entscheidungen?"
    a: "Nicht aus Wissensmangel, sondern durch kognitive Verzerrungen unter Unsicherheit — Sunk-Cost, Bestätigungsfehler, Hype-Druck."
  - q: "Lässt sich Entscheidungsqualität verbessern?"
    a: "Ja, durch Struktur: explizite Annahmen, Gegen-These, reversible vs. irreversible Entscheidungen trennen — nicht durch mehr Daten."
  - q: "Was ist eine reversible Entscheidung?"
    a: "Eine, die sich günstig zurücknehmen lässt; sie verträgt Tempo. Irreversible Entscheidungen verdienen mehr Sorgfalt."
---

## Woran scheitern Architektur-Entscheidungen wirklich?

<!-- DRAFT -->
An Verzerrungen, nicht an Wissen. Sunk-Cost und Bestätigungsfehler wirken am stärksten unter Zeitdruck.

## Wie trennt man reversible von irreversiblen Entscheidungen?

<!-- DRAFT -->
Reversibles verträgt Tempo; Irreversibles verdient Sorgfalt. Die Verwechslung kostet am meisten.

## Welche Struktur schützt vor Hype-Entscheidungen?

<!-- DRAFT -->
Explizite Annahmen plus eine ernst gemeinte Gegen-These entkoppeln die Wahl von der lautesten Meinung im Raum.
```

- [ ] **Step 3: Write the failing test** `tests/unit/articles.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { getAllArticles, getArticle, allArticleRoutes } from "../../src/lib/content/articles";

test("getAllArticles returns all 4 articles, newest first", () => {
  const all = getAllArticles();
  assert.equal(all.length, 4);
  const dates = all.map((a) => a.published);
  const sorted = [...dates].sort((a, b) => b.localeCompare(a));
  assert.deepEqual(dates, sorted);
});

test("getArticle shapes frontmatter + renders body html", () => {
  const a = getArticle("nearshore-vs-offshore");
  assert.ok(a);
  assert.equal(a.author, "german-rauhut");
  assert.match(a.title, /Nearshore/);
  assert.ok(a.lead.length > 40);
  assert.ok(a.faq && a.faq.length >= 3);
  assert.match(a.bodyHtml, /<h2/);
});

test("getArticle returns null for an unknown slug", () => {
  assert.equal(getArticle("does-not-exist"), null);
});

test("allArticleRoutes lists the index + every article", () => {
  const routes = allArticleRoutes();
  assert.ok(routes.includes("/perspektiven"));
  assert.ok(routes.includes("/perspektiven/nearshore-vs-offshore"));
  assert.equal(routes.length, 5);
});
```

- [ ] **Step 4: Add the test to `package.json`** `test:unit` script

Change the `test:unit` line to append the new file:

```json
"test:unit": "node --import tsx --test tests/unit/aggregate-test-scope.test.mjs tests/unit/sitemap.test.ts tests/unit/stats-breakdown.test.ts tests/unit/articles.test.ts",
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '../../src/lib/content/articles'`.

- [ ] **Step 6: Write `src/lib/content/articles.ts`**

```ts
import { readCollection, readEntry } from "./collection";
import { renderMarkdown } from "./markdown";
import type { AuthorId } from "@/lib/authors";
import type { FaqItem } from "@/components/ProductFaq";

const DIR = "perspektiven";

interface ArticleFrontmatter {
  title: string;
  lead: string;
  author: AuthorId;
  published: string;
  updated?: string;
  topic: string;
  description?: string;
  faq?: FaqItem[];
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  bodyHtml: string;
}

function shape(slug: string, data: ArticleFrontmatter, body: string): Article {
  return { slug, ...data, bodyHtml: renderMarkdown(body) };
}

export function getArticle(slug: string): Article | null {
  const e = readEntry<ArticleFrontmatter>(DIR, slug);
  return e ? shape(e.slug, e.data, e.body) : null;
}

export function getAllArticles(): Article[] {
  return readCollection<ArticleFrontmatter>(DIR)
    .map((e) => shape(e.slug, e.data, e.body))
    .sort((a, b) => b.published.localeCompare(a.published));
}

export function allArticleRoutes(): string[] {
  return ["/perspektiven", ...getAllArticles().map((a) => `/perspektiven/${a.slug}`)];
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test:unit`
Expected: PASS (all 4 article tests green).

- [ ] **Step 8: Commit**

```bash
git add src/lib/authors.ts src/content/perspektiven src/lib/content/articles.ts tests/unit/articles.test.ts package.json
git commit -m "feat(perspektiven): article content collection + author identity + loader"
```

---

## Task 2: BlogPosting schema with Person/Organization author switch

**Files:**
- Create: `src/lib/schema/article.ts`
- Create: `tests/unit/perspektiven-schema.test.ts`
- Modify: `package.json` (add the new test file to `test:unit`)

**Interfaces:**
- Consumes: `getAuthor` + `Author` from `@/lib/authors`.
- Produces: `blogPostingSchema({ title, lead, slug, author, published, updated? })` → a typed JSON-LD object.

- [ ] **Step 1: Write the failing test** `tests/unit/perspektiven-schema.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { blogPostingSchema } from "../../src/lib/schema/article";

const base = {
  title: "Test",
  lead: "Ein zitierbarer Lead-Absatz für den Test mit ausreichender Länge.",
  slug: "test",
  published: "2026-06-24",
};

test("german-rauhut author → Person node", () => {
  const s = blogPostingSchema({ ...base, author: "german-rauhut" });
  assert.equal(s["@type"], "BlogPosting");
  assert.equal(s.author["@type"], "Person");
  assert.equal(s.author.name, "German Rauhut");
  assert.equal(s.datePublished, "2026-06-24");
  assert.equal(s.dateModified, "2026-06-24");
  assert.equal(s.mainEntityOfPage, "https://neckarshore.ai/perspektiven/test");
});

test("neckarshore author → Organization node", () => {
  const s = blogPostingSchema({ ...base, author: "neckarshore" });
  assert.equal(s.author["@type"], "Organization");
});

test("unknown author → Organization fallback (fail-safe)", () => {
  const s = blogPostingSchema({ ...base, author: "ghost" });
  assert.equal(s.author["@type"], "Organization");
});

test("updated overrides dateModified", () => {
  const s = blogPostingSchema({ ...base, author: "neckarshore", updated: "2026-06-25" });
  assert.equal(s.dateModified, "2026-06-25");
});
```

- [ ] **Step 2: Add the test to `package.json`** `test:unit` (append `tests/unit/perspektiven-schema.test.ts`).

- [ ] **Step 3: Run to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — `Cannot find module '../../src/lib/schema/article'`.

- [ ] **Step 4: Write `src/lib/schema/article.ts`**

```ts
import { getAuthor } from "@/lib/authors";

const BASE_URL = "https://neckarshore.ai";

const PUBLISHER = {
  "@type": "Organization",
  name: "neckarshore.ai",
  url: `${BASE_URL}/`,
  logo: { "@type": "ImageObject", url: `${BASE_URL}/icon.svg` },
} as const;

interface BlogPostingInput {
  title: string;
  lead: string;
  slug: string;
  author: string;
  published: string;
  updated?: string;
}

/** BlogPosting JSON-LD. Author resolves to a Person (founder) or Organization (fail-safe). */
export function blogPostingSchema({ title, lead, slug, author, published, updated }: BlogPostingInput) {
  const a = getAuthor(author);
  const authorNode =
    a.id === "german-rauhut"
      ? { "@type": "Person", name: a.name, jobTitle: "Founder", url: a.url, sameAs: a.sameAs }
      : { "@type": "Organization", name: a.name, url: a.url };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: lead,
    datePublished: published,
    dateModified: updated ?? published,
    author: authorNode,
    publisher: PUBLISHER,
    mainEntityOfPage: `${BASE_URL}/perspektiven/${slug}`,
    inLanguage: "de-DE",
  } as const;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schema/article.ts tests/unit/perspektiven-schema.test.ts package.json
git commit -m "feat(perspektiven): BlogPosting schema with Person/Organization author switch"
```

---

## Task 3: Article detail route `/perspektiven/[slug]`

**Files:**
- Create: `src/components/ArticleByline.tsx`
- Create: `src/components/AuthorBio.tsx`
- Create: `src/app/perspektiven/[slug]/page.tsx`
- Create: `tests/e2e/perspektiven.spec.ts`

**Interfaces:**
- Consumes: `getArticle`, `getAllArticles` (`@/lib/content/articles`); `blogPostingSchema` (`@/lib/schema/article`); `getAuthor` (`@/lib/authors`); `JsonLd`, `Breadcrumbs`, `Prose`, `ProductFaq`, `Nav`, `Footer`; `pageMetadata`; `BreadcrumbCrumb` (`@/lib/schema/breadcrumb`).

- [ ] **Step 1: Write `src/components/ArticleByline.tsx`**

```tsx
import { getAuthor } from "@/lib/authors";

/** Author name + formatted publish date under the article H1. */
export function ArticleByline({ author, published }: { author: string; published: string }) {
  const a = getAuthor(author);
  const date = new Date(published).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <p className="mt-4 text-sm text-muted dark:text-text-tertiary">
      Von <span className="font-medium text-primary/80 dark:text-text-secondary">{a.name}</span>
      <span className="mx-2" aria-hidden="true">·</span>
      <time dateTime={published}>{date}</time>
    </p>
  );
}
```

- [ ] **Step 2: Write `src/components/AuthorBio.tsx`**

```tsx
import { getAuthor } from "@/lib/authors";

/** End-of-article author authority block (E-E-A-T). */
export function AuthorBio({ author }: { author: string }) {
  const a = getAuthor(author);
  return (
    <aside className="mt-12 rounded-xl border border-primary/10 bg-white/50 p-5 dark:border-text-secondary/10 dark:bg-surface/40">
      <p className="font-heading text-base font-semibold text-primary dark:text-text-primary">
        {a.name}
      </p>
      <p className="text-sm text-muted dark:text-text-tertiary">{a.role}</p>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
        {a.bio}
      </p>
    </aside>
  );
}
```

- [ ] **Step 3: Write the failing e2e test** `tests/e2e/perspektiven.spec.ts` (detail-page block)

```ts
import { test, expect } from "@playwright/test";

test.describe("Perspektiven — detail (TC-PSP)", () => {
  const url = "/perspektiven/nearshore-vs-offshore";

  test("TC-PSP-001 article page loads with H1 + byline", async ({ page }) => {
    await page.goto(url);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText("Nearshore");
    await expect(page.getByText("German Rauhut")).toBeVisible();
  });

  test("TC-PSP-002 emits BlogPosting + FAQPage JSON-LD", async ({ page }) => {
    await page.goto(url);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const joined = blocks.join("");
    expect(joined).toContain('"BlogPosting"');
    expect(joined).toContain('"FAQPage"');
    expect(joined).toContain('"BreadcrumbList"');
  });

  test("TC-PSP-003 no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(url);
    expect(errors).toEqual([]);
  });

  test("TC-PSP-004 unknown slug 404s", async ({ page }) => {
    const res = await page.goto("/perspektiven/does-not-exist");
    expect(res?.status()).toBe(404);
  });
});
```

- [ ] **Step 4: Run to verify it fails**

Run: `npm run test:e2e -- perspektiven`
Expected: FAIL — route does not exist (navigation 404 / locator timeouts).

- [ ] **Step 5: Write `src/app/perspektiven/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Prose } from "@/components/Prose";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductFaq } from "@/components/ProductFaq";
import { ArticleByline } from "@/components/ArticleByline";
import { AuthorBio } from "@/components/AuthorBio";
import { pageMetadata } from "@/lib/seo";
import { getArticle, getAllArticles } from "@/lib/content/articles";
import { blogPostingSchema } from "@/lib/schema/article";
import type { BreadcrumbCrumb } from "@/lib/schema/breadcrumb";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return pageMetadata({
    title: `${a.title} | neckarshore.ai`,
    description: a.description ?? a.lead,
    path: `/perspektiven/${slug}`,
    type: "article",
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const trail: BreadcrumbCrumb[] = [
    { name: "Start", href: "/" },
    { name: "Perspektiven", href: "/perspektiven" },
    { name: a.title },
  ];
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd
        data={blogPostingSchema({ title: a.title, lead: a.lead, slug: a.slug, author: a.author, published: a.published, updated: a.updated })}
        id={`schema-blogposting-${slug}`}
      />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={trail} />
        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">{a.title}</h1>
            <ArticleByline author={a.author} published={a.published} />
          </header>
          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">{a.lead}</p>
          <div className="mt-10">
            <Prose html={a.bodyHtml} />
          </div>
          <ProductFaq slug={slug} items={a.faq} indexable />
          <AuthorBio author={a.author} />
          <div className="mt-10">
            <Link href="/perspektiven" className="text-sm font-medium text-accent hover:text-accent-hover" data-track="perspektiven_back">
              ← Alle Perspektiven
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm run test:e2e -- perspektiven`
Expected: PASS (TC-PSP-001..004).

- [ ] **Step 7: Commit**

```bash
git add src/components/ArticleByline.tsx src/components/AuthorBio.tsx src/app/perspektiven/[slug]/page.tsx tests/e2e/perspektiven.spec.ts
git commit -m "feat(perspektiven): article detail route + byline + author bio"
```

---

## Task 4: Index route `/perspektiven` + ArticleCard

**Files:**
- Create: `src/components/ArticleCard.tsx`
- Create: `src/app/perspektiven/page.tsx`
- Modify: `tests/e2e/perspektiven.spec.ts` (add the index block)

**Interfaces:**
- Consumes: `getAllArticles`; `collectionPageSchema` (`@/lib/schema/product`); `getAuthor`; `JsonLd`, `Nav`, `Footer`, `pageMetadata`.

- [ ] **Step 1: Write `src/components/ArticleCard.tsx`**

```tsx
import Link from "next/link";
import { getAuthor } from "@/lib/authors";
import type { Article } from "@/lib/content/articles";

export function ArticleCard({ article }: { article: Article }) {
  const a = getAuthor(article.author);
  const date = new Date(article.published).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" });
  return (
    <Link
      href={`/perspektiven/${article.slug}`}
      data-track={`perspektiven_card_${article.slug}`}
      className="block rounded-xl border border-primary/10 bg-white/50 p-6 transition-colors hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface"
    >
      <h2 className="font-heading text-xl font-bold text-primary dark:text-text-primary">{article.title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">{article.lead}</p>
      <p className="mt-3 text-sm text-muted dark:text-text-tertiary">
        {a.name} <span className="mx-1" aria-hidden="true">·</span> <time dateTime={article.published}>{date}</time>
      </p>
    </Link>
  );
}
```

- [ ] **Step 2: Write the failing e2e test** (append to `tests/e2e/perspektiven.spec.ts`)

```ts
test.describe("Perspektiven — index (TC-PSP)", () => {
  test("TC-PSP-010 index lists all 4 articles", async ({ page }) => {
    await page.goto("/perspektiven");
    await expect(page.locator("h1")).toContainText("Perspektiven");
    const cards = page.locator('a[data-track^="perspektiven_card_"]');
    await expect(cards).toHaveCount(4);
  });

  test("TC-PSP-011 newest article appears before older", async ({ page }) => {
    await page.goto("/perspektiven");
    const first = page.locator('a[data-track^="perspektiven_card_"]').first();
    await expect(first).toContainText("Nearshore");
  });

  test("TC-PSP-012 card links to the detail page", async ({ page }) => {
    await page.goto("/perspektiven");
    await page.locator('a[data-track="perspektiven_card_nearshore-vs-offshore"]').click();
    await expect(page).toHaveURL(/\/perspektiven\/nearshore-vs-offshore$/);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm run test:e2e -- perspektiven`
Expected: FAIL — `/perspektiven` route does not exist.

- [ ] **Step 4: Write `src/app/perspektiven/page.tsx`**

```tsx
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ArticleCard } from "@/components/ArticleCard";
import { pageMetadata } from "@/lib/seo";
import { getAllArticles } from "@/lib/content/articles";
import { collectionPageSchema } from "@/lib/schema/product";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";
const DESCRIPTION =
  "Perspektiven auf Nearshore-Entwicklung, KI-beschleunigte Software, DSGVO-by-Design und Entscheidungsqualität — für CTOs im DACH-Mittelstand.";

export const metadata: Metadata = pageMetadata({
  title: "Perspektiven — neckarshore.ai",
  description: DESCRIPTION,
  path: "/perspektiven",
});

export default function PerspektivenPage() {
  const articles = getAllArticles();
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd
        data={collectionPageSchema({ name: "Perspektiven", description: DESCRIPTION, url: "https://neckarshore.ai/perspektiven" })}
        id="schema-collectionpage-perspektiven"
      />
      <main className="mx-auto max-w-[860px] px-4 pt-40 pb-20 md:px-6">
        <header className="mb-10">
          <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">Perspektiven</h1>
          <p className="mt-4 text-xl leading-relaxed text-primary/90 dark:text-text-primary">{DESCRIPTION}</p>
        </header>
        <div className="grid gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npm run test:e2e -- perspektiven`
Expected: PASS (TC-PSP-010..012 + the earlier detail tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ArticleCard.tsx src/app/perspektiven/page.tsx tests/e2e/perspektiven.spec.ts
git commit -m "feat(perspektiven): index hub route + article card"
```

---

## Task 5: Nav integration

**Files:**
- Modify: `src/components/Nav.tsx:16` (the `navLinksTail` array)
- Modify: `tests/e2e/perspektiven.spec.ts` (add a nav test)

- [ ] **Step 1: Write the failing test** (append to `tests/e2e/perspektiven.spec.ts`)

```ts
test("TC-PSP-020 nav has a Perspektiven link reaching the surface", async ({ page }) => {
  await page.goto("/");
  const link = page.locator('a[data-track="nav_perspektiven"]').first();
  await expect(link).toHaveAttribute("href", "/perspektiven");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:e2e -- perspektiven`
Expected: FAIL — no `nav_perspektiven` link.

- [ ] **Step 3: Edit `src/components/Nav.tsx`** — replace the `navLinksTail` line (currently `const navLinksTail = [{ href: "/#founder", label: "Über uns", track: "nav_founder" }];`):

```ts
const navLinksTail = [
  { href: "/perspektiven", label: "Perspektiven", track: "nav_perspektiven" },
  { href: "/#founder", label: "Über uns", track: "nav_founder" },
];
```

(Both the desktop row and the mobile menu already iterate `navLinksTail`, so this one change wires both. The links render via `<a>` — a full navigation to `/perspektiven`, which is correct for a cross-route link.)

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:e2e -- perspektiven`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx tests/e2e/perspektiven.spec.ts
git commit -m "feat(perspektiven): top-level Perspektiven nav link (desktop + mobile)"
```

---

## Task 6: Sitemap integration

**Files:**
- Modify: `src/app/sitemap.ts` (add `allArticleRoutes()` to the `paths` array)
- Modify: `tests/unit/sitemap.test.ts` (assert the article routes)

- [ ] **Step 1: Write the failing test** — add to `tests/unit/sitemap.test.ts` (match the file's existing `node:test` style):

```ts
test("sitemap includes the Perspektiven surface + articles", () => {
  const urls = sitemap().map((e) => e.url);
  assert.ok(urls.some((u) => u.endsWith("/perspektiven")));
  assert.ok(urls.some((u) => u.endsWith("/perspektiven/nearshore-vs-offshore")));
});
```

(If `sitemap`/`assert`/`test` are already imported at the top of the file, reuse those imports — do not duplicate them.)

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — article URLs absent from the sitemap.

- [ ] **Step 3: Edit `src/app/sitemap.ts`** — import `allArticleRoutes` and add it to `paths`:

```ts
import { allProductRoutes } from "@/lib/portfolio";
import { allArticleRoutes } from "@/lib/content/articles";
// ...
  const paths = [
    "/impressum",
    "/datenschutz",
    ...allProductRoutes(),
    ...allArticleRoutes(),
  ].sort((a, b) => a.localeCompare(b));
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts tests/unit/sitemap.test.ts
git commit -m "feat(perspektiven): add article routes to the sitemap"
```

---

## Task 7: Cmd+K search index integration

**Files:**
- Modify: `src/lib/search/index-data.ts` (add an articles loop)
- Modify: `tests/search/index-data.test.ts` (assert every article slug indexed)

**Interfaces:**
- Consumes: `getAllArticles` (`@/lib/content/articles`). Articles index as `type: "page"`, `category: "Perspektiven"` (no `SearchType` union change).

- [ ] **Step 1: Write the failing test** — add to `tests/search/index-data.test.ts` (reuse its existing imports/style):

```ts
test("every Perspektiven article is indexed", () => {
  const docs = buildSearchDocs();
  for (const slug of ["nearshore-vs-offshore", "ki-beschleunigte-entwicklung", "dsgvo-by-design", "entscheidungsqualitaet-cto"]) {
    assert.ok(docs.some((d) => d.url === `/perspektiven/${slug}`), `missing ${slug}`);
  }
  assert.ok(docs.some((d) => d.url === "/perspektiven"), "missing index");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:search:unit`
Expected: FAIL — article docs missing.

- [ ] **Step 3: Edit `src/lib/search/index-data.ts`** — import the loader and push article docs inside `buildSearchDocs`, after the products loop, before `return docs;`:

```ts
import { getAllArticles } from "@/lib/content/articles";
// ... inside buildSearchDocs(), after the products loop:

  // 3) Perspektiven — the index hub + one doc per article.
  docs.push({
    id: "page:/perspektiven",
    type: "page",
    title: "Perspektiven",
    text: "Thought-Leadership zu Nearshore, KI-beschleunigter Entwicklung, DSGVO-by-Design und Entscheidungsqualität.",
    category: "Perspektiven",
    url: "/perspektiven",
  });
  for (const a of getAllArticles()) {
    docs.push({
      id: `article:${a.slug}`,
      type: "page",
      title: a.title,
      text: a.lead,
      category: "Perspektiven",
      url: `/perspektiven/${a.slug}`,
    });
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:search:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/search/index-data.ts tests/search/index-data.test.ts
git commit -m "feat(perspektiven): index articles in the Cmd+K search"
```

---

## Task 8: llms.txt integration

**Files:**
- Modify: `public/llms.txt` (add a Perspektiven section)
- Modify: `tests/e2e/seo.spec.ts` (assert the section + URLs) — grep the file first for the next free `TC-SEO-NNN`.

- [ ] **Step 1: Write the failing test** — add to `tests/e2e/seo.spec.ts` (use the next free TC-SEO id; the example uses `027`):

```ts
test("TC-SEO-027 llms.txt lists the Perspektiven surface + articles", async ({ request }) => {
  const body = await (await request.get("/llms.txt")).text();
  expect(body).toContain("## Perspektiven");
  expect(body).toContain("/perspektiven/nearshore-vs-offshore");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:e2e -- seo`
Expected: FAIL — no Perspektiven section.

- [ ] **Step 3: Edit `public/llms.txt`** — insert this block after the `## Products` section (before `## Services`):

```markdown
## Perspektiven

Thought-leadership articles for DACH-Mittelstand CTOs, on neckarshore's own domain. Overview: https://neckarshore.ai/perspektiven
- Nearshore vs. Offshore — what CTOs really weigh when choosing a development partner. https://neckarshore.ai/perspektiven/nearshore-vs-offshore
- AI-accelerated software development — what really changes, and what stays hype. https://neckarshore.ai/perspektiven/ki-beschleunigte-entwicklung
- DSGVO-by-Design — data protection as an architecture decision, not a checkbox. https://neckarshore.ai/perspektiven/dsgvo-by-design
- Decision quality in tech leadership — better architecture decisions under uncertainty. https://neckarshore.ai/perspektiven/entscheidungsqualitaet-cto
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:e2e -- seo`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/llms.txt tests/e2e/seo.spec.ts
git commit -m "feat(perspektiven): add the surface to llms.txt for AI discovery"
```

---

## Task 9: Final integration verify + SITE_UPDATED bump

**Files:**
- Modify: `src/lib/site-config.ts` (bump `SITE_UPDATED`)

- [ ] **Step 1: Bump `SITE_UPDATED`** in `src/lib/site-config.ts` to the article publish date (a real content revision):

```ts
export const SITE_UPDATED = "2026-06-24";
```

- [ ] **Step 2: Full build + lint**

Run: `npm run lint && npm run build`
Expected: clean — no ESLint warnings, build succeeds, `/perspektiven` + 4 article routes prerendered (static).

- [ ] **Step 3: Full unit + search suites**

Run: `npm run test:unit && npm run test:search:unit`
Expected: PASS (articles, schema, sitemap, search invariants all green).

- [ ] **Step 4: Full e2e suite (kill :3000 first — flake hygiene)**

Run: `lsof -ti tcp:3000 | xargs kill 2>/dev/null; npm run test:e2e`
Expected: PASS (all suites incl. TC-PSP-*); log the run in `docs/test-log.md` as `ad-hoc`.

- [ ] **Step 5: Lighthouse on the new routes**

Run: `npm run lighthouse:quick` (with a server on :3000)
Expected: a11y / best-practices / SEO @95 on `/perspektiven` + an article page; perf is soft-warn only.

- [ ] **Step 6: Commit**

```bash
git add src/lib/site-config.ts docs/test-log.md
git commit -m "chore(perspektiven): bump SITE_UPDATED + log e2e run"
```

- [ ] **Step 7: Push the branch (NO prod merge — Founder gate)**

```bash
git push -u origin linus/perspektiven-surface
```

The surface is now built + tested on the branch. **Do not merge to `main`** until the Founder fills the article copy (the bodies are drafts) and approves. The downstream content phase (Founder + Gary) replaces the `<!-- DRAFT -->` bodies with real prose; the prod merge is the acceptance gate.

---

## Self-Review

**Spec coverage:** Every spec section maps to a task — content model + 4 pillars (T1), frontmatter schema (T1), collection/loader (T1), routes (T3/T4), BlogPosting + author switch (T2), FAQPage (T3 via `ProductFaq indexable`), Nav/sitemap/search/llms.txt integration (T5–T8), citable anatomy (encoded in the T1 article bodies + the draft H2 structure), testing (each task is TDD + T9 full-suite), out-of-scope items not built (no taxonomy/RSS/glossar). Author bio / E-E-A-T block (T3). ✅

**Placeholder scan:** No "TBD/TODO" in the plan steps; the `<!-- DRAFT -->` markers are intentional article-copy placeholders (the downstream content phase fills them), explicitly called out as such — they are content, not plan gaps. ✅

**Type consistency:** `AuthorId`/`getAuthor` (authors.ts) consistent across articles.ts, article.ts, ArticleByline, AuthorBio, ArticleCard. `Article` shape consistent T1→T3/T4. `blogPostingSchema` signature consistent T2→T3. `FaqItem` reused from `ProductFaq`. `allArticleRoutes` consistent T1→T6. ✅
