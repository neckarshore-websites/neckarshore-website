/**
 * Unit tests for the blog loader (src/lib/content/blog.ts) — TC-BLOG-001 to TC-BLOG-012.
 *
 * What these guard, and why each one exists:
 *
 * 1. THE DRAFT GATE FAILS CLOSED. A draft is visible only in local development or on a Vercel
 *    preview. A missing or unknown environment hides it. The opposite wording ("hidden when
 *    production") leaks a draft the day VERCEL_ENV is absent from a production build.
 * 2. THE SITEMAP NEVER SEES A DRAFT, in any environment. `getPublishedPosts()` ignores the gate.
 * 3. FIGURE MARKERS CANNOT VANISH. A marker is an HTML comment, and sanitize-html strips
 *    comments — so a typo'd marker would disappear without a trace and the figure with it. The
 *    body is split on markers BEFORE rendering, and every comment that is not a known marker,
 *    every unknown id and every repeated id throws at build time.
 * 4. FRONTMATTER IS VALIDATED, not trusted: the blog is the first page on this site that grows
 *    by content rather than by code, so a post with a missing field or an over-long description
 *    must stop the build instead of shipping half-filled.
 *
 * Every test sets NODE_ENV and VERCEL_ENV explicitly: `npm run test:unit` runs with no NODE_ENV,
 * so relying on the ambient value would test whatever shell the run happened to start in.
 *
 * Run: `npm run test:unit`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DESCRIPTION_MAX,
  adjacent,
  aggregateCategories,
  assertSlug,
  categorySlug,
  SEO_TITLE_MAX,
  draftsVisible,
  filterVisible,
  getAdjacentPosts,
  getCategories,
  getPost,
  getPosts,
  getPublishedPosts,
  splitBody,
  validateFrontmatter,
} from "../../src/lib/content/blog";
import { FIGURE_IDS } from "../../src/lib/content/blog-figures";

const DEV = { NODE_ENV: "development" };
const PREVIEW = { NODE_ENV: "production", VERCEL_ENV: "preview" };
const PRODUCTION = { NODE_ENV: "production", VERCEL_ENV: "production" };
const CI_BUILD = { NODE_ENV: "production" }; // a production build with no Vercel env at all
const NOTHING = {};

const VALID = {
  title: "Ein Titel",
  seoTitle: "Ein SEO-Titel",
  description: "Eine Beschreibung.",
  dek: "Ein Vorspann.",
  date: "2026-11-10",
  author: "German Rauhut",
  cover: {
    src: "/blog/x/titelbild.webp",
    width: 1920,
    height: 1080,
    alt: "Alt",
    caption: "Bildunterschrift",
    credit: "Grafik: neckarshore.ai",
  },
  ogImage: "/blog/x/og.jpg",
  aiNote: "Hinweis.",
  categories: ["Testmanagement"],
  further: [{ title: "Quelle", url: "https://example.org/a" }],
  draft: false,
};

test("TC-BLOG-001: drafts are visible in local development and on a Vercel preview", () => {
  assert.equal(draftsVisible(DEV), true);
  assert.equal(draftsVisible(PREVIEW), true);
});

test("TC-BLOG-002: drafts stay hidden in production, in a bare CI build and with no environment", () => {
  assert.equal(draftsVisible(PRODUCTION), false);
  assert.equal(draftsVisible(CI_BUILD), false);
  assert.equal(draftsVisible(NOTHING), false);
});

test("TC-BLOG-003: the gate drops drafts in production and keeps them on a preview (synthetic posts)", () => {
  // Synthetic on purpose: once the first post is published there is no real draft left, and a
  // test that loops over real drafts would then pass by checking nothing.
  const posts = [
    { slug: "entwurf", draft: true },
    { slug: "veroeffentlicht", draft: false },
  ];
  assert.deepEqual(filterVisible(posts, PRODUCTION).map((p) => p.slug), ["veroeffentlicht"]);
  assert.deepEqual(filterVisible(posts, CI_BUILD).map((p) => p.slug), ["veroeffentlicht"]);
  assert.deepEqual(filterVisible(posts, PREVIEW).map((p) => p.slug), ["entwurf", "veroeffentlicht"]);
});

test("TC-BLOG-003b: a real draft, while one exists, is absent from the list and from getPost() in production", () => {
  const drafts = getPosts(DEV).filter((p) => p.draft);
  for (const draft of drafts) {
    assert.equal(getPost(draft.slug, PRODUCTION), null, `${draft.slug} must not resolve in production`);
    assert.ok(
      !getPosts(PRODUCTION).some((p) => p.slug === draft.slug),
      `${draft.slug} must not be listed in production`,
    );
  }
});

test("TC-BLOG-004: getPublishedPosts() never returns a draft, whatever the environment says", () => {
  for (const post of getPublishedPosts()) {
    assert.equal(post.draft, false, `${post.slug} is a draft but reached the published list`);
  }
});

test("TC-BLOG-005: the list is sorted newest first", () => {
  const dates = getPosts(DEV).map((p) => p.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test("TC-BLOG-006: splitBody puts a known figure between the rendered text segments", () => {
  const id = FIGURE_IDS[0];
  const segments = splitBody(`Erster Absatz.\n\n<!-- figur: ${id} -->\n\nZweiter Absatz.`);
  assert.deepEqual(
    segments.map((s) => s.kind),
    ["html", "figure", "html"],
  );
  assert.equal(segments[1].kind === "figure" && segments[1].id, id);
  assert.match(segments[0].kind === "html" ? segments[0].html : "", /Erster Absatz/);
});

test("TC-BLOG-007: an unknown figure id stops the build", () => {
  assert.throws(() => splitBody("Text\n\n<!-- figur: gibt-es-nicht -->\n"), /unknown figure/i);
});

test("TC-BLOG-008: the same figure twice in one post stops the build", () => {
  const id = FIGURE_IDS[0];
  assert.throws(
    () => splitBody(`<!-- figur: ${id} -->\n\nText\n\n<!-- figur: ${id} -->`),
    /more than once/i,
  );
});

test("TC-BLOG-009: a comment that is not a valid marker (a typo) stops the build instead of vanishing", () => {
  assert.throws(() => splitBody("Text\n\n<!-- figure: risikoregister -->\n"), /not a figure marker/i);
});

test("TC-BLOG-010: frontmatter limits — SEO title and description lengths, date format, required fields", () => {
  assert.doesNotThrow(() => validateFrontmatter("ok", VALID));
  assert.throws(
    () => validateFrontmatter("long-title", { ...VALID, seoTitle: "x".repeat(SEO_TITLE_MAX + 1) }),
    /seoTitle/,
  );
  assert.throws(
    () => validateFrontmatter("long-desc", { ...VALID, description: "x".repeat(DESCRIPTION_MAX + 1) }),
    /description/,
  );
  assert.throws(() => validateFrontmatter("bad-date", { ...VALID, date: "10.11.2026" }), /date/);
  assert.throws(() => validateFrontmatter("no-draft-flag", { ...VALID, draft: undefined }), /draft/);
  const noAlt = { ...VALID, cover: { ...VALID.cover, alt: "" } };
  assert.throws(() => validateFrontmatter("no-alt", noAlt), /cover\.alt/);
});

test("TC-BLOG-011: every real post renders each of its figure markers exactly once", () => {
  for (const post of getPosts(DEV)) {
    const markers = [...post.body.matchAll(/<!--\s*figur:\s*([a-z0-9-]+)\s*-->/g)].map((m) => m[1]);
    const rendered = post.segments.filter((s) => s.kind === "figure").map((s) => (s.kind === "figure" ? s.id : ""));
    assert.deepEqual(rendered, markers, `${post.slug}: rendered figures must match the markers in source order`);
    assert.equal(new Set(rendered).size, rendered.length, `${post.slug}: a figure appears twice`);
  }
});

test("TC-BLOG-012: the first post is present, carries all three figures and is reachable in development", () => {
  const post = getPost("risikobasierte-teststrategie-ios", DEV);
  assert.ok(post, "the test strategy post must load");
  const figures = post.segments.filter((s) => s.kind === "figure").map((s) => (s.kind === "figure" ? s.id : ""));
  assert.deepEqual(figures, [
    "teststrategie-risikoregister",
    "teststrategie-testlaeufe",
    "teststrategie-vokabular",
  ]);
  assert.ok(post.readingMinutes >= 1, "reading time is computed");
});

test("TC-BLOG-013: a slug outside [a-z0-9-] stops the build (it becomes an href)", () => {
  assert.equal(assertSlug("risikobasierte-teststrategie-ios"), "risikobasierte-teststrategie-ios");
  for (const bad of ["Entwurf (2)", "javascript:alert(1)", "a--b", "-a", "a/b", "ä", ""]) {
    assert.throws(() => assertSlug(bad), /not a valid slug/, `"${bad}" must be refused`);
  }
});

test("TC-BLOG-014: category slugs normalise umlauts and stay inside the slug rule", () => {
  assert.equal(categorySlug("Künstliche Intelligenz"), "kuenstliche-intelligenz");
  assert.equal(categorySlug("KI-Agenten"), "ki-agenten");
  assert.equal(categorySlug("Größe & Maß"), "groesse-mass");
  assert.throws(() => categorySlug("!!!"), /not a valid slug/);
});

test("TC-BLOG-015: categories are counted by slug, sorted A→Z, and a slug collision stops the build", () => {
  const cats = aggregateCategories([
    { categories: ["Testmanagement", "KI-Agenten"] },
    { categories: ["KI-Agenten"] },
  ]);
  assert.deepEqual(
    cats.map((c) => [c.name, c.slug, c.count]),
    [
      ["KI-Agenten", "ki-agenten", 2],
      ["Testmanagement", "testmanagement", 1],
    ],
  );
  assert.throws(
    () => aggregateCategories([{ categories: ["KI-Agenten"] }, { categories: ["KI Agenten"] }]),
    /share the slug/,
  );
});

test("TC-BLOG-016: derived views read through the gate — a draft is never a neighbour and never a category in production (synthetic)", () => {
  // The test drafts are dated before the real post; a derivation from every file instead of
  // the gate would make a draft the published post's "next" and put its category in the
  // production sidebar — both 404 links. Checked on the pure functions with the gate applied.
  const posts = [
    { slug: "neu", draft: false, categories: ["Testmanagement"] },
    { slug: "entwurf", draft: true, categories: ["Nur im Entwurf"] },
    { slug: "alt", draft: false, categories: ["Testmanagement"] },
  ];
  const live = filterVisible(posts, PRODUCTION);
  assert.deepEqual(adjacent(live, "neu").next?.slug, "alt", "the draft is skipped as a neighbour");
  assert.deepEqual(adjacent(live, "alt").prev?.slug, "neu");
  assert.ok(
    !aggregateCategories(live).some((c) => c.slug === "nur-im-entwurf"),
    "a draft-only category must not exist in production",
  );
  const preview = filterVisible(posts, PREVIEW);
  assert.equal(adjacent(preview, "neu").next?.slug, "entwurf", "on a preview the draft is a neighbour");
});

test("TC-BLOG-016b: the real wiring — while drafts exist, production categories and neighbours contain none of them", () => {
  // Meaningful exactly while drafts exist, which is the only time anything can leak.
  const drafts = getPosts(DEV).filter((p) => p.draft);
  const live = getPosts(PRODUCTION);
  const liveCategorySlugs = new Set(live.flatMap((p) => p.categories.map(categorySlug)));
  for (const cat of getCategories(PRODUCTION)) {
    assert.ok(liveCategorySlugs.has(cat.slug), `category ${cat.slug} exists in production without a live post`);
  }
  const draftSlugs = new Set(drafts.map((d) => d.slug));
  for (const post of live) {
    const { prev, next } = getAdjacentPosts(post.slug, PRODUCTION);
    assert.ok(!prev || !draftSlugs.has(prev.slug), `${post.slug}: prev is a draft`);
    assert.ok(!next || !draftSlugs.has(next.slug), `${post.slug}: next is a draft`);
  }
});

test("TC-BLOG-017: adjacency has no wrap-around and is empty for an unknown slug", () => {
  const posts = [{ slug: "a" }, { slug: "b" }];
  assert.deepEqual(adjacent(posts, "a"), { prev: null, next: posts[1] });
  assert.deepEqual(adjacent(posts, "b"), { prev: posts[0], next: null });
  assert.deepEqual(adjacent(posts, "x"), { prev: null, next: null });
});

test("TC-BLOG-018: a Weiterführend link is https or an internal path — nothing else reaches an href", () => {
  const withLink = (url: string) => ({ ...VALID, further: [{ title: "T", url }] });
  assert.doesNotThrow(() => validateFrontmatter("ok-https", withLink("https://glossary.istqb.org/")));
  assert.doesNotThrow(() => validateFrontmatter("ok-internal", withLink("/test-management")));
  for (const bad of ["http://example.org", "javascript:alert(1)", "//evil.example", "mailto:a@b.c", "ftp://x"]) {
    assert.throws(() => validateFrontmatter("bad", withLink(bad)), /further\[0\]\.url/, bad);
  }
  assert.throws(() => validateFrontmatter("no-cats", { ...VALID, categories: [] }), /categories/);
});

test("TC-BLOG-019: no post whose slug starts with test- is ever published", () => {
  // Test posts exist only to fill the preview; they are drafts by rule, and this keeps a
  // flipped flag from putting one on neckarshore.ai.
  for (const post of getPublishedPosts()) {
    assert.ok(!post.slug.startsWith("test-"), `${post.slug} is a test post and must stay a draft`);
  }
});
