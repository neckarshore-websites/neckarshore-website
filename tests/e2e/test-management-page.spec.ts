import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * /test-management — "Wie wir testen" detail surface (backlog #245, UD5 Front-10).
 *
 * Verifies the page is DATA-BOUND to the same single source as the homepage tile
 * (public/estate-test-scope.json) — never a second hardcoded figure that can drift — and
 * holds the honesty guardrails (phonesis absent; rounded-down aggregate; Top-N + rest-rollup
 * so the 0-test scaffold repo and the known-red repo are not individually spotlighted). Also
 * checks the 13-test-type scope, the per-repo Typ column, and the /tests→/test-management 308.
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
    per_repo: (raw.per_repo ?? []) as { repo: string; total: number }[],
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
 * High-sensitivity private repos that must NEVER reach the public /test-management surface — the
 * 4 R2-confirmed leakers the withhold STOPGAP (PR #525 / work-order) targets. A curated canary,
 * not the full private set: a hit here is a real privacy regression. A repo legitimately going
 * public is a deliberate review trigger — update this list then.
 */
const PRIVATE_CANARIES = [
  "omnopsis-backend",
  "snakeoil-check",
  "omnopsis-frontend",
  "observatory",
];

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

  test("TC-CNT-069: headline number is data-bound to estate-test-scope.json (floored + '+')", async ({
    page,
  }) => {
    const scope = loadScope();
    const floored = scope.floor ? Math.floor(scope.total / 100) * 100 : scope.total;
    const expected = floored.toLocaleString("de-DE") + (scope.floor ? "+" : "");

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
    // Hard guardrail: the BLOCKED clone is never on the public surface.
    expect(body.toLowerCase()).not.toContain("phonesis");
    // The GEO-citable method passage (the lever #246 points at).
    expect(body).toContain("Test-Runner");
    expect(body).toContain("grep");
    expect(body).toContain("gegengeprüft"); // the re-check method, framed generically
  });

  test("TC-CNT-071: per-repo table has a Typ column, Top-N + rest-rollup (no 0-row / no red-test spotlight)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const table = page.locator("main table");
    await expect(table).toBeVisible();
    // Three columns now: Repository · Typ · Tests.
    await expect(table.locator("thead th")).toHaveCount(3);
    await expect(table.locator("thead")).toContainText("Typ");
    // Top-6 + at most one rollup row.
    expect(await table.locator("tbody tr").count()).toBeLessThanOrEqual(7);
    await expect(table).toContainText("weitere Repositories");
    const tableText = (await table.textContent()) ?? "";
    // Typ classification surfaces for the PUBLIC rows (neckarshore-website → Webseite,
    // obsidian-vault-autopilot/imap → Plugin/Skill). Note: post-withhold (#525) no "Produkt"
    // row is visible — every omnopsis-* Produkt repo in the Top-N is private → anonymized.
    expect(tableText).toContain("Webseite");
    expect(tableText).toContain("Plugin/Skill");
    // Withheld private repos surface as anonymized rows (count kept, no name/Typ).
    expect(tableText).toContain("privates Repo");
    // §5b: the 0-test scaffold repo and the known-red repo (#257) stay in the rollup, not spotlit.
    expect(tableText).not.toContain("clearpath-52");
    expect(tableText).not.toContain("oakwoodgolfclub-website");
  });

  test("TC-CNT-074: 'Was abgedeckt ist' lists the full 13-test-type scope (no per-type numbers)", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const main = page.locator("main");
    await expect(main).toContainText("13 Testarten");
    const types = page.locator('ul[aria-label="Abgedeckte Testarten"] li');
    await expect(types).toHaveCount(13);
    // A representative span of the 13 is present.
    for (const t of ["Unit", "End-to-End", "Security", "Accessibility", "AI-Eval"]) {
      await expect(types.filter({ hasText: t }).first()).toBeVisible();
    }
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

  test("TC-CNT-083: PRIVACY INVARIANT — estate-test-scope.json names zero private repos (per_repo + missing)", () => {
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
    // Withheld private repos surface only as an anonymized label — count kept, no name/Typ.
    expect(mainText).toContain("privates Repo");
  });

  test("TC-CNT-085: HONESTY INVARIANT — Σ per_repo.total still equals the headline total", () => {
    const scope = loadScope();
    const sum = scope.per_repo.reduce((s, r) => s + r.total, 0);
    // Anonymization renames slugs only — it must never touch a count, so the per-repo rows still
    // sum to the headline (2.611). Guards against a transform that drops/alters entries.
    expect(sum).toBe(scope.total);
  });
});
