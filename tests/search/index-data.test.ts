/**
 * Coverage invariant + search-behaviour for the Cmd+K index.
 *
 * Run: `npm run test:search:unit` (tsx, node:assert — neckarshore has no vitest).
 *
 * The coverage checks derive expectations from the SAME sources the builder reads
 * (portfolio.ts + the glossar collection), so a newly-added product or glossar
 * entry that silently fell out of the index fails this test — "alle Seiten
 * indiziert" is an enforced invariant, not a one-time effort. We deliberately do
 * NOT test against the sitemap: allProductRoutes() excludes the noindex preview
 * skeletons, which ARE in the search index on purpose.
 */
import assert from "node:assert/strict";
import MiniSearch from "minisearch";
import { buildSearchDocs } from "../../src/lib/search/index-data";
import { allItems } from "../../src/lib/portfolio";
import { getAllGlossarEntries } from "../../src/lib/content/glossar";
import type { SearchDoc } from "../../src/lib/search/types";

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
  for (const t of ["page", "product", "glossar"]) {
    assert.ok(docs.some((d) => d.type === t), `missing type ${t}`);
  }
});

check("EVERY portfolio item has a product doc (coverage invariant)", () => {
  for (const item of allItems()) {
    const doc = docs.find((d) => d.type === "product" && d.url === item.href);
    assert.ok(doc, `no search doc for product '${item.name}' (${item.href})`);
  }
});

check("EVERY glossar entry has a glossar doc with its definition (Volltext)", () => {
  for (const entry of getAllGlossarEntries()) {
    const doc = docs.find((d) => d.type === "glossar" && d.url === `/glossar/${entry.slug}`);
    assert.ok(doc, `no search doc for glossar '${entry.term}'`);
    assert.ok(doc!.text.includes(entry.definition), `glossar '${entry.term}' doc missing its definition`);
  }
});

check("the static + section pages are all indexed", () => {
  for (const url of [
    "/",
    "/#services",
    "/#why-nearshore",
    "/#founder",
    "/#faq",
    "/products",
    "/glossar",
    "/impressum",
    "/datenschutz",
  ]) {
    assert.ok(docs.find((d) => d.type === "page" && d.url === url), `missing page ${url}`);
  }
});

check("external 'Websites' products carry external:true + an https url", () => {
  const ext = docs.filter((d) => d.type === "product" && d.url.startsWith("http"));
  assert.ok(ext.length >= 1, "expected at least one external product");
  for (const d of ext) assert.equal(d.external, true, `${d.title} external flag not set`);
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

check("minisearch finds a glossar entry by topic ('verzerrung')", () => {
  assert.ok(find("verzerrung").some((h) => h.type === "glossar"), "no glossar hit for 'verzerrung'");
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

check("minisearch finds an external site ('goldoni') as external product", () => {
  const hits = find("goldoni");
  assert.ok(
    hits.some((h) => h.type === "product" && h.external === true),
    "no external product hit for 'goldoni'"
  );
});

console.log(`index-data: ${pass} passed, ${fail} failed (${docs.length} docs)`);
process.exit(fail ? 1 : 0);
