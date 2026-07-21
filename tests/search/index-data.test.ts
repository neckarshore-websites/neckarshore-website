/**
 * Coverage invariant + search-behaviour for the Cmd+K index.
 *
 * Run: `npm run test:search:unit` (tsx, node:assert — neckarshore has no vitest).
 *
 * The coverage checks derive expectations from the SAME source the builder reads
 * (portfolio.ts), so a newly-added product that silently fell out of the index
 * fails this test — "alle Seiten indiziert" is an enforced invariant, not a
 * one-time effort. We deliberately do NOT test against the sitemap:
 * allProductRoutes() excludes the noindex preview skeletons, which ARE in the
 * search index on purpose. (The /glossar surface was retired 2026-06-23.)
 */
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import MiniSearch from "minisearch";
import { buildSearchDocs } from "../../src/lib/search/index-data";
import { allItems } from "../../src/lib/portfolio";
import type { SearchDoc } from "../../src/lib/search/types";

/** Every STATIC app route (src/app/**​/page.tsx), excluding dynamic [slug] segments
 *  and /api — those are covered by the per-item product doc checks. */
function staticAppRoutes(): string[] {
  const APP_DIR = fileURLToPath(new URL("../../src/app", import.meta.url));
  const routes: string[] = [];
  const walk = (dir: string, base: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (e.name.startsWith("[") || e.name === "api") continue; // dynamic / non-page
        walk(`${dir}/${e.name}`, `${base}/${e.name}`);
      } else if (e.name === "page.tsx") {
        routes.push(base === "" ? "/" : base);
      }
    }
  };
  walk(APP_DIR, "");
  return routes;
}

let pass = 0,
  fail = 0;
function check(label: string, fn: () => void) {
  try {
    fn();
    pass++;
  } catch (e) {
    fail++;
    console.error(`  ✗ ${label}\n    ${(e as Error).message.split("\n")[0]}`);
  }
}

const docs: SearchDoc[] = buildSearchDocs();
const mini = new MiniSearch<SearchDoc>({
  fields: ["title", "text"],
  storeFields: ["title", "type", "category", "url", "external"],
  searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 } },
});
mini.addAll(docs);
const find = (q: string) => mini.search(q) as unknown as SearchDoc[];

check("covers every SearchType", () => {
  for (const t of ["page", "product"]) {
    assert.ok(docs.some((d) => d.type === t), `missing type ${t}`);
  }
});

check("EVERY portfolio item has a product doc (coverage invariant)", () => {
  for (const item of allItems()) {
    // Website case-study items resolve to their internal page; the rest keep their href.
    const expectedUrl = item.caseStudySlug
      ? `/products/websites/${item.caseStudySlug}`
      : item.href;
    const doc = docs.find((d) => d.type === "product" && d.url === expectedUrl);
    assert.ok(doc, `no search doc for product '${item.name}' (${expectedUrl})`);
  }
});

check("no glossar docs remain (the surface was retired 2026-06-23)", () => {
  assert.equal(
    docs.filter((d) => d.url.startsWith("/glossar")).length,
    0,
    "a /glossar doc is still in the search index after retirement",
  );
});

/** Routes that HAVE a page.tsx but are DELIBERATELY kept out of on-site search.
 *  /style-guide is an internal design-system reference — noindex, absent from the
 *  sitemap, reachable only via a discreet footer meta-link (2026-07-21, German
 *  Rauhut: "es ist für mich, keiner soll suchen"). It must NOT surface in the
 *  Cmd+K palette, so the coverage invariant carves it out explicitly. */
const UNINDEXED_INTERNAL = new Set(["/style-guide"]);

check("EVERY static app route is indexed (literal 'alle Seiten indiziert')", () => {
  // Derives routes from the filesystem, so a newly-added top-level page that
  // forgot its index entry fails here — not just the hand-listed ones below.
  // Deliberately-internal routes (UNINDEXED_INTERNAL) are the sanctioned exception.
  for (const route of staticAppRoutes()) {
    if (UNINDEXED_INTERNAL.has(route)) continue;
    const doc = docs.find((d) => d.url === route);
    assert.ok(doc, `no search doc for app route ${route} (page.tsx exists, index entry missing)`);
  }
});

check("internal /style-guide stays OUT of on-site search (it's for the founder, not visitors)", () => {
  assert.equal(
    docs.filter((d) => d.url === "/style-guide" || d.url.startsWith("/style-guide#")).length,
    0,
    "the internal /style-guide reference must never enter the search index",
  );
});

check("the static + section pages are all indexed", () => {
  for (const url of [
    "/",
    "/#services",
    "/#why-nearshore",
    "/#founder",
    "/#faq",
    "/products",
    "/impressum",
    "/datenschutz",
  ]) {
    assert.ok(docs.find((d) => d.type === "page" && d.url === url), `missing page ${url}`);
  }
});

check("Websites case-study products point INTERNAL (/products/websites/) and are not external", () => {
  const websiteDocs = docs.filter(
    (d) => d.type === "product" && d.url.startsWith("/products/websites/"),
  );
  assert.ok(websiteDocs.length >= 1, "expected at least one website case-study product doc");
  for (const d of websiteDocs) {
    assert.notEqual(d.external, true, `${d.title} wrongly marked external`);
    assert.ok(!d.url.startsWith("http"), `${d.title} should be an internal url`);
  }
});

check("internal docs never set external", () => {
  for (const d of docs) {
    if (!d.url.startsWith("http")) assert.notEqual(d.external, true, `${d.id} wrongly marked external`);
  }
});

check("all ids are unique", () => {
  const ids = docs.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate doc id");
});

check("section deep-links use the on-page anchors", () => {
  const services = docs.find((d) => d.url === "/#services");
  assert.ok(services && /^\/#[a-z-]+$/.test(services.url), services?.url);
});

check("minisearch finds a preview product by name ('phonesis')", () => {
  const hits = find("phonesis");
  assert.ok(
    hits.some((h) => h.type === "product" && h.url.includes("phonesis")),
    "no product hit for 'phonesis'"
  );
});

check("minisearch finds the nearshore section ('nearshore')", () => {
  assert.ok(find("nearshore").some((h) => h.type === "page"), "no page hit for 'nearshore'");
});

check("minisearch finds 'goldoni' as an internal case-study product", () => {
  const hits = find("goldoni");
  assert.ok(
    hits.some(
      (h) => h.type === "product" && h.url === "/products/websites/ristorante-goldoni",
    ),
    "no internal case-study hit for 'goldoni'"
  );
});

console.log(`index-data: ${pass} passed, ${fail} failed (${docs.length} docs)`);
process.exit(fail ? 1 : 0);
