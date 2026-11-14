import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * /test-management — "Wie wir testen" detail surface (backlog #245, UD5 Front-10).
 *
 * Verifies the page is DATA-BOUND to the same single source as the homepage tile
 * (public/estate-test-scope.json) — never a second hardcoded figure that can drift — and
 * holds the honesty guardrails (EXACT aggregate + load-bearing "+" per the 2026-07-10 Founder
 * directive, backed by a dated audited_floor when it exceeds Σ per_repo). Since #370 (Founder
 * order 2026-11-14) the table lists EVERY repository with tests, split by test level, and the
 * levels are totalled; the old Top-N rollup is retired. Also checks the test-purpose list, the
 * per-repo Typ column, and the /tests→/test-management 308.
 */

const ROUTE = "/test-management";

function loadScope() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "estate-test-scope.json"), "utf-8"),
  );
  return {
    total: raw.total as number,
    repos: raw.repos as number,
    floor: Boolean(raw.floor),
    per_repo: (raw.per_repo ?? []) as {
      repo: string;
      total: number;
      byType?: Record<string, number>;
    }[],
    byType: (raw.byType ?? {}) as Record<string, number>,
    untyped_total: (raw.untyped_total ?? 0) as number,
    // Optional audited floor (Founder directive 2026-07-10): when the headline exceeds Σ per_repo,
    // this dated + sourced field is the ONLY legitimate reason (TC-CNT-085).
    audited_floor: (raw.audited_floor ?? null) as {
      total: number;
      audited: string;
      source: string;
      applied: boolean;
    } | null,
  };
}

/** The live public-repo set — the same single source the withholder keeps named (#94/#525). */
function publicRepoSet(): Set<string> {
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "repositories.json"), "utf-8"),
  );
  return new Set(
    (raw.repos ?? []).map((r: { owner: string; name: string }) => `${r.owner}/${r.name}`),
  );
}

/**
 * High-sensitivity private repo SLUGS that must NEVER reach the public /test-management surface.
 * Post disclosure-config (Pass-2a): the 4 approved private products are DISCLOSED by product name
 * (Omnopsis/Phonesis) but their raw slug is still forbidden — omnopsis-backend/-frontend render as
 * "Omnopsis", never "omnopsis-backend". A curated canary, not the full private set: a hit here is a
 * real privacy regression. A repo legitimately going public is a deliberate review trigger.
 */
const PRIVATE_CANARIES = [
  "omnopsis-backend",
  "snakeoil-check",
  "omnopsis-frontend",
  "observatory",
];

/** The disclosure allow-list: named_private slugs + slug→product-name display map (Pass-2a). */
function loadDisclosureConfig(): {
  named_private: string[];
  display_overrides: Record<string, string>;
} {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "disclosure-config.json"), "utf-8"),
  );
}

async function ldNodes(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = page.locator('script[type="application/ld+json"]');
  const count = await blocks.count();
  const nodes: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const txt = await blocks.nth(i).textContent();
    if (txt) {
      const parsed = JSON.parse(txt);
      nodes.push(...((parsed["@graph"] ?? [parsed]) as Record<string, unknown>[]));
    }
  }
  return nodes;
}

test.describe("Content surface — /test-management (KI-Testen detail)", () => {
  test("TC-CNT-068: 200, single H1, canonical, WebPage JSON-LD with its own @id", async ({
    page,
  }) => {
    const res = await page.goto(ROUTE);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://neckarshore.ai/test-management",
    );
    const webpages = (await ldNodes(page)).filter((n) => n["@type"] === "WebPage");
    expect(webpages.length).toBeGreaterThanOrEqual(1);
    expect(
      webpages.some(
        (w) => w["@id"] === "https://neckarshore.ai/test-management#webpage",
      ),
    ).toBe(true);
  });

  test("TC-CNT-069: headline number is data-bound to estate-test-scope.json (exact + '+')", async ({
    page,
  }) => {
    const scope = loadScope();
    // Exact figure (Founder directive 2026-07-10 — round-down framing retired) + load-bearing "+".
    const expected = scope.total.toLocaleString("de-DE") + (scope.floor ? "+" : "");

    await page.goto(ROUTE);
    const main = page.locator("main");
    // Same single source as the tile → no second literal that can drift.
    await expect(main).toContainText(`${expected} automatisierte Tests`);
    await expect(main).toContainText(`${scope.repos} unserer Repositories`);
  });

  test("TC-CNT-070: public-safe — phonesis absent; runner-counted + re-check passage present", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const body = (await page.locator("main").textContent()) ?? "";
    // Hard guardrail: the private SLUG never reaches the public surface. Post disclosure-config the
    // PRODUCT name "Phonesis" is Founder-approved (it would render by name IF phonesis-voicebank
    // ever gains test-scope data — it has none today), so the privacy line is the slug, not the word.
    expect(body).not.toContain("phonesis-voicebank");
    // The GEO-citable method passage (the lever #246 points at).
    expect(body).toContain("Test-Runner");
    expect(body).toContain("grep");
    expect(body).toContain("gegengeprüft"); // the re-check method, framed generically
  });

  test("TC-CNT-071: per-repo table lists EVERY repository with tests, split by level (#370)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const scope = loadScope();
    const table = page.locator("[data-repo-breakdown] table");
    await expect(table).toBeVisible();
    // Repository · Typ · Unit · Integration · End-to-End · Smoke · Gesamt.
    const head = (await table.locator("thead").textContent()) ?? "";
    for (const h of ["Repository", "Typ", "Unit", "Integration", "End-to-End", "Smoke", "Gesamt"]) {
      expect(head).toContain(h);
    }
    // All rows, no rollup.
    const rows = table.locator("tbody tr[data-repo-row]");
    await expect(rows).toHaveCount(scope.per_repo.length);
    expect(scope.per_repo.length).toBe(scope.repos);
    await expect(table).not.toContainText("weitere Repositories");
    // A row without a split says so, once per such row, and never shows zeros in its place.
    const unsplit = scope.per_repo.filter((r) => Object.keys(r.byType ?? {}).length === 0).length;
    await expect(table.locator("td[data-unsplit]")).toHaveCount(unsplit);
    for (const cell of await table.locator("td[data-unsplit]").all()) {
      await expect(cell).toHaveText("nicht aufgeteilt");
    }
    // The Gesamt column carries every row's real count, largest first.
    const totals = (await rows.locator("td:last-child").allTextContents()).map((t) =>
      Number(t.replace(/\./g, "")),
    );
    expect(totals).toEqual([...scope.per_repo].map((r) => r.total).sort((a, b) => b - a));
    const tableText = (await table.textContent()) ?? "";
    // Public non-product rows keep their slug's last segment + a real Typ.
    expect(tableText).toContain("Webseite");
    // Rows that share a display name are told apart ("Omnopsis · 1 von 3"), withheld rows stay
    // anonymous; every other rendered name is unique.
    const names = (await rows.locator("th").allTextContents()).filter((n) => n !== "privates Repo");
    expect(new Set(names).size).toBe(names.length);
    // Raw slugs that must never appear.
    expect(tableText).not.toContain("clearpath-52");
  });

  test("TC-CNT-109: per-level totals are data-bound and sum to the headline (#370)", async ({
    page,
  }) => {
    const scope = loadScope();
    const typed = Object.values(scope.byType).reduce((s, n) => s + n, 0);
    // The invariant the page asserts at build time, checked on the data the e2e run serves.
    expect(typed + scope.untyped_total).toBe(scope.total);

    await page.goto(ROUTE);
    const block = page.locator("[data-level-totals]");
    const labels: Record<string, string> = {
      unit: "Unit",
      integration: "Integration",
      e2e: "End-to-End",
      smoke: "Smoke",
    };
    for (const [key, label] of Object.entries(labels)) {
      const row = block.locator(`tr[data-level="${key}"]`);
      await expect(row).toContainText(label);
      await expect(row).toContainText((scope.byType[key] ?? 0).toLocaleString("de-DE"));
    }
    await expect(block.locator('tr[data-level="untyped"]')).toContainText("ohne Zuordnung");
    await expect(block.locator('tr[data-level="untyped"]')).toContainText(
      scope.untyped_total.toLocaleString("de-DE"),
    );
    const headline = scope.total.toLocaleString("de-DE") + (scope.floor ? "+" : "");
    await expect(block.locator('tr[data-level="sum"]')).toContainText(headline);
  });

  test("TC-CNT-110: the overtaken sentences are gone (#370 corrections 1 and 3)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const body = (await page.locator("main").textContent()) ?? "";
    // The figure is exact since the Founder directive of 2026-07-10, not rounded down.
    expect(body).not.toContain("nach unten");
    expect(body).not.toContain("gerundet");
    // The level split exists now.
    expect(body).not.toContain("nur teilweise verfügbar");
    expect(body).toContain("exakte Zahl");
  });

  test("TC-CNT-074: 'Was abgedeckt ist' separates counted levels from test purposes (#370)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const main = page.locator("main");
    // No count of purposes in the text (Engels' wording rule 1, #370): the list speaks for itself.
    await expect(main).not.toContainText("13 Testarten");
    const purposes = page.locator('ul[aria-label="Prüfzwecke"] li');
    // Only purposes with evidence in the estate; the four counted levels are not repeated here.
    const texts = await purposes.allTextContents();
    expect(texts.length).toBeGreaterThan(0);
    for (const level of ["Unit", "Integration", "End-to-End", "Smoke"]) {
      expect(texts).not.toContain(level);
    }
    for (const t of ["Accessibility", "Security", "SEO/GEO"]) expect(texts).toContain(t);
    // A→Z, case-insensitive (global sorting rule).
    expect(texts).toEqual([...texts].sort((a, b) => a.localeCompare(b, "de", { sensitivity: "base" })));
  });

  test("TC-CNT-072: sitemap lists /test-management", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("https://neckarshore.ai/test-management");
    // the short-lived old path must NOT be a sitemap entry.
    expect(xml).not.toContain("<loc>https://neckarshore.ai/tests</loc>");
  });

  test("TC-CNT-075: /tests permanently redirects to /test-management (308)", async ({
    request,
  }) => {
    const res = await request.get("/tests", { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toBe("/test-management");
  });

  test("TC-CNT-073: homepage Tests tile links to /test-management with a 'mehr' cue", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.locator('a[data-track="stats_tests_detail"]');
    await expect(link).toHaveAttribute("href", "/test-management");
    await expect(link).toContainText("Automatisierte Tests");
    // The repo count was removed from the tile; a "mehr" cue signals the detail page.
    await expect(page.getByTestId("tests-subline")).toContainText("mehr");
  });

  test("TC-CNT-083: PRIVACY INVARIANT — estate-test-scope.json leaks zero private repo SLUGs (per_repo + missing)", () => {
    const file = path.join(process.cwd(), "public", "estate-test-scope.json");
    const raw = fs.readFileSync(file, "utf-8");
    const scope = JSON.parse(raw);
    const pub = publicRepoSet();

    // Structural + self-maintaining (stronger than the 4 canaries, mirrors TC-CNT-078): the two
    // slug-bearing fields are per_repo[].repo and missing[] (verified the complete set against
    // the emitted structure). Every value that still looks like a slug (contains "/") MUST be a
    // confirmed-public repo. Withheld entries become "privates Repo" (no "/") and slip the
    // filter — that is the design. This also guards the missing[] fail-day vector: the only
    // statsPath producer is the PRIVATE omnopsis-backend, so a failed fetch would land its slug
    // here in cleartext absent the withhold.
    const slugs: string[] = [
      ...(scope.per_repo ?? []).map((r: { repo: string }) => r.repo),
      ...(scope.missing ?? []),
    ];
    for (const slug of slugs) {
      if (slug.includes("/")) {
        expect(
          pub.has(slug),
          `"${slug}" is named in estate-test-scope.json but is not a confirmed-public repo`,
        ).toBe(true);
      }
    }

    // Named canary: none of the 4 R2-confirmed private names anywhere in the raw public file.
    for (const name of PRIVATE_CANARIES) {
      expect(raw, `private repo "${name}" must not appear in estate-test-scope.json`).not.toContain(
        name,
      );
    }

    // The page still has data to render (we did not anonymize the file into uselessness).
    expect((scope.per_repo ?? []).length).toBeGreaterThan(0);

    // `unstamped` is a TRANSIENT pipeline field (SHA-stamp coverage WARN + job summary) and MUST
    // NOT be persisted to the served artifact — otherwise it is a THIRD slug-bearing field the
    // slug scan above does not cover. update-stats.yml strips it via `del(.unstamped)`; this locks
    // the "exactly two slug-bearing fields" assumption so a future re-add fails loudly here.
    expect(
      scope.unstamped,
      "unstamped must stay transient — never persisted to the served estate-test-scope.json",
    ).toBeUndefined();
  });

  test("TC-CNT-084: PRIVACY INVARIANT — /test-management renders no private repo name", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const mainText = (await page.locator("main").textContent()) ?? "";
    for (const name of PRIVATE_CANARIES) {
      expect(
        mainText,
        `private repo "${name}" must not render on the public /test-management page`,
      ).not.toContain(name);
    }
    // Withholding is active: the served data carries anonymized rows ("privates Repo", count kept,
    // no name/Typ). Since #370 every row renders, so the label is on the page whenever the data has
    // such rows; the hard privacy guarantee is still the canary loop above (no raw private name ever renders);
    // this positive assertion verifies — ranking-independently — that the withholding transform ran.
    expect(loadScope().per_repo.some((r) => r.repo === "privates Repo")).toBe(true);
  });

  test("TC-CNT-085: HONESTY INVARIANT — headline total is Σ per_repo OR a dated, sourced audited floor", () => {
    const scope = loadScope();
    const sum = scope.per_repo.reduce((s, r) => s + r.total, 0);
    // Disclosure renames slugs only — it must never touch a count. The headline must be EITHER
    // the per-repo row-sum OR the declared audited_floor.total (whichever is greater) — nothing
    // else. Guards against (a) a transform that drops/alters entries AND (b) silent inflation:
    // any total not backed by the row-sum MUST be backed by a dated + sourced audit field.
    const floorTotal = scope.audited_floor?.total ?? 0;
    expect(scope.total).toBe(Math.max(sum, floorTotal));
    if (scope.total > sum) {
      // The excess is only legitimate with full audit provenance + the applied marker.
      expect(scope.audited_floor?.applied).toBe(true);
      expect(scope.audited_floor?.audited).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect((scope.audited_floor?.source ?? "").length).toBeGreaterThan(10);
    }
  });

  test("TC-CNT-086: DISCLOSURE INVARIANT — approved-private products by product name, slug never raw", async ({
    page,
  }) => {
    const cfg = loadDisclosureConfig();
    const rawEstate = fs.readFileSync(
      path.join(process.cwd(), "public", "estate-test-scope.json"),
      "utf-8",
    );
    const scope = loadScope();

    // HARD RULE (data-driven, always holds): no named_private SLUG in the committed public file …
    for (const slug of cfg.named_private) {
      expect(rawEstate, `named_private slug leaked raw in estate-test-scope.json: ${slug}`).not.toContain(
        slug,
      );
    }

    await page.goto(ROUTE);
    const mainText = (await page.locator("main").textContent()) ?? "";
    // … nor on the rendered page.
    for (const slug of cfg.named_private) {
      expect(mainText, `named_private slug leaked raw on the page: ${slug}`).not.toContain(slug);
    }

    // POSITIVE: since #370 the board lists every repository, so every approved-private product in
    // the data is shown by its product name (shared names carry "· k von n", which still contains
    // the name).
    const privateProductNames = new Set(cfg.named_private.map((s) => cfg.display_overrides[s]));
    const listed = scope.per_repo;
    const rendered = new Set(
      listed.map((r) => r.repo).filter((name) => privateProductNames.has(name)),
    );
    for (const name of rendered) {
      expect(
        mainText,
        `approved-private product "${name}" is in the data but not rendered by name`,
      ).toContain(name);
    }
  });
});
