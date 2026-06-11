#!/usr/bin/env node

/**
 * Cross-site recursive link crawler — 404 / broken-link detection.
 *
 * Crawls one or more sites breadth-first, following INTERNAL (same-origin)
 * HTML pages recursively and status-checking every link/asset it finds.
 * External links are status-checked once and never recursed.
 *
 * Usage:
 *   node scripts/link-crawler.mjs                       (crawl all default sites)
 *   node scripts/link-crawler.mjs https://rauhut.com    (crawl one site)
 *   node scripts/link-crawler.mjs --no-external         (skip external link checks)
 *   node scripts/link-crawler.mjs --max-pages=200       (cap pages per site)
 *   node scripts/link-crawler.mjs --concurrency=8       (parallel requests)
 *   node scripts/link-crawler.mjs --json                (machine-readable output)
 *   node scripts/link-crawler.mjs --self-test           (offline unit smoke test)
 *
 * Exit codes:
 *   0  no broken INTERNAL links (external 4xx/5xx are warnings only)
 *   1  at least one broken internal link, OR --self-test assertion failed
 *
 * Zero dependencies — Node 20+ global fetch + regex HTML extraction.
 * Why regex, not a DOM parser: a link crawler only needs href/src strings;
 * pulling in cheerio for that is overkill for a dev utility.
 */

import { argv, exit } from "node:process";

// ── Config ───────────────────────────────────────────────────────────

const DEFAULT_SITES = [
  "https://neckarshore.ai",
  "https://oakwoodgolfclub.de",
  "https://ristorante-goldoni.de",
  "https://rauhut.com",
];

const DEFAULTS = {
  maxPages: 300,
  concurrency: 6,
  timeoutMs: 15000,
  external: true,
  userAgent: "neckarshore-link-crawler/1.0 (+https://neckarshore.ai)",
};

// ── Pure helpers (unit-tested via --self-test) ───────────────────────

const SKIP_SCHEME = /^(mailto:|tel:|javascript:|data:|blob:|sms:|#)/i;

/**
 * Decode the HTML entities that legitimately appear inside attribute values.
 * Critical for query strings: `?url=x&amp;w=96` must become `?url=x&w=96`,
 * otherwise the `amp;w` param is malformed and servers (e.g. Next.js
 * `/_next/image`) reject it with a 400 — a false-positive broken link.
 * `&amp;` is decoded LAST so `&amp;#38;` resolves to the literal `&#38;`.
 */
export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

/**
 * Resolve an href found on `baseUrl` to an absolute http(s) URL with the
 * hash stripped. Returns null for non-navigable schemes or parse failures.
 */
export function normalizeUrl(href, baseUrl) {
  if (!href) return null;
  const trimmed = decodeEntities(href.trim());
  if (!trimmed || SKIP_SCHEME.test(trimmed)) return null;
  let u;
  try {
    u = new URL(trimmed, baseUrl);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  // Reject JS/template artefacts that regex extraction can pick up from inline
  // code (e.g. `img.src = imgs[i]`). Real URLs on these sites never contain
  // bare [ ] { } ` $ — these markers mean we matched code, not a link.
  if (/[[\]{}`$]/.test(trimmed)) return null;
  u.hash = "";
  return u.toString();
}

/** True if `url` shares an origin with `origin` (host + protocol + port). */
export function isInternal(url, origin) {
  try {
    return new URL(url).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/**
 * Extract candidate link targets from raw HTML: href= and src= attributes,
 * resolved against baseUrl and de-duplicated. Good enough for crawling.
 */
export function extractLinks(html, baseUrl) {
  // Drop <script>/<style> *bodies* before extraction so inline JS like
  // `el.src = imgs[i]` is not mistaken for a link. The opening tag (and its
  // real src=/href= attributes) is preserved, only the element content goes.
  const cleaned = html
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, "$1")
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, "$1")
    .replace(/<!--[\s\S]*?-->/g, "");
  const out = new Set();
  const attr = /(?:href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s">]+))/gi;
  let m;
  while ((m = attr.exec(cleaned)) !== null) {
    const raw = m[2] ?? m[3] ?? m[4] ?? "";
    const abs = normalizeUrl(raw, baseUrl);
    if (abs) out.add(abs);
  }
  return [...out];
}

// ── Network ──────────────────────────────────────────────────────────

/**
 * Fetch a URL and return its final status. Uses GET (we need the body for
 * internal HTML pages anyway); for external link probes we only read headers.
 */
async function probe(url, opts, wantBody) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": opts.userAgent },
    });
    const type = res.headers.get("content-type") || "";
    const isHtml = type.includes("text/html");
    const body = wantBody && isHtml ? await res.text() : null;
    return {
      status: res.status,
      ok: res.ok,
      redirected: res.redirected,
      finalUrl: res.url,
      isHtml,
      body,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      redirected: false,
      finalUrl: url,
      isHtml: false,
      body: null,
      error: err.name === "AbortError" ? "timeout" : err.code || err.message,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Crawl one site ───────────────────────────────────────────────────

async function crawlSite(root, opts) {
  const origin = new URL(root).origin;
  const visited = new Set(); // urls we have probed (internal + external)
  const queued = new Set(); // internal urls scheduled to crawl
  const broken = []; // { url, status, error, foundOn, internal }
  const queue = [{ url: root, foundOn: "(root)" }];
  queued.add(root);
  let pagesCrawled = 0;

  // Worker pool over a growing queue.
  async function worker() {
    while (queue.length > 0) {
      if (pagesCrawled >= opts.maxPages) {
        queue.length = 0;
        break;
      }
      const job = queue.shift();
      if (!job) break;
      const { url, foundOn } = job;
      if (visited.has(url)) continue;
      visited.add(url);

      const internal = isInternal(url, origin);
      if (!internal && !opts.external) continue;

      const res = await probe(url, opts, internal);
      if (!res.ok) {
        broken.push({
          url,
          status: res.status,
          error: res.error || null,
          foundOn,
          internal,
        });
      }

      // Recurse only into internal HTML pages.
      if (internal && res.isHtml && res.body) {
        pagesCrawled++;
        for (const link of extractLinks(res.body, res.finalUrl || url)) {
          const isInt = isInternal(link, origin);
          if (isInt) {
            if (!queued.has(link) && !visited.has(link)) {
              queued.add(link);
              queue.push({ url: link, foundOn: url });
            }
          } else if (opts.external && !queued.has(link) && !visited.has(link)) {
            queued.add(link);
            queue.push({ url: link, foundOn: url });
          }
        }
      }
    }
  }

  const workers = Array.from({ length: opts.concurrency }, () => worker());
  await Promise.all(workers);

  return {
    root,
    pagesCrawled,
    linksChecked: visited.size,
    broken,
    brokenInternal: broken.filter((b) => b.internal),
    brokenExternal: broken.filter((b) => !b.internal),
  };
}

// ── Reporting ────────────────────────────────────────────────────────

function printReport(results) {
  let hardFail = false;
  for (const r of results) {
    console.log(`\n── ${r.root} ──────────────────────────────────────`);
    console.log(
      `   pages crawled: ${r.pagesCrawled}   links checked: ${r.linksChecked}` +
        `   broken: ${r.broken.length} (internal ${r.brokenInternal.length}, external ${r.brokenExternal.length})`,
    );
    for (const b of r.broken) {
      const tag = b.internal ? "INTERNAL" : "external";
      const code = b.status === 0 ? `ERR:${b.error}` : `HTTP ${b.status}`;
      console.log(`   ${b.internal ? "❌" : "⚠️ "} [${tag}] ${code}  ${b.url}`);
      console.log(`        ↳ linked from: ${b.foundOn}`);
    }
    if (r.brokenInternal.length > 0) hardFail = true;
    if (r.broken.length === 0) console.log("   ✅ no broken links");
  }
  return hardFail;
}

// ── Self-test (offline smoke test of the pure helpers) ───────────────

function selfTest() {
  let pass = 0;
  let fail = 0;
  const eq = (got, want, label) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (ok) pass++;
    else {
      fail++;
      console.error(`  ✗ ${label}\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`);
    }
  };

  const base = "https://example.com/dir/page";
  eq(normalizeUrl("/about", base), "https://example.com/about", "abs from root-relative");
  eq(normalizeUrl("sub", base), "https://example.com/dir/sub", "abs from doc-relative");
  eq(normalizeUrl("https://x.com/a#frag", base), "https://x.com/a", "hash stripped");
  eq(
    normalizeUrl("/_next/image?url=%2Fa.jpg&amp;w=96&amp;q=75", base),
    "https://example.com/_next/image?url=%2Fa.jpg&w=96&q=75",
    "&amp; decoded in query (Next.js image false-positive guard)",
  );
  eq(decodeEntities("a&amp;b&#38;c&#x26;d"), "a&b&c&d", "decodeEntities named+dec+hex");
  eq(normalizeUrl("mailto:a@b.de", base), null, "mailto skipped");
  eq(normalizeUrl("tel:+49", base), null, "tel skipped");
  eq(normalizeUrl("#section", base), null, "in-page anchor skipped");
  eq(normalizeUrl("javascript:void(0)", base), null, "javascript: skipped");
  eq(normalizeUrl("", base), null, "empty skipped");

  eq(isInternal("https://example.com/x", base), true, "same origin internal");
  eq(isInternal("https://other.com/x", base), false, "diff origin external");
  eq(isInternal("http://example.com/x", "https://example.com/"), false, "scheme mismatch external");

  const html = `
    <a href="/a">A</a>
    <a href='sub/b'>B</a>
    <link rel="stylesheet" href="https://cdn.com/s.css">
    <img src="/img/x.png">
    <a href="#top">skip</a>
    <a href="mailto:x@y.de">skip</a>
    <script src=//example.com/j.js></script>`;
  const links = extractLinks(html, base).sort();
  eq(
    links,
    [
      "https://cdn.com/s.css",
      "https://example.com/a",
      "https://example.com/dir/sub/b",
      "https://example.com/img/x.png",
      "https://example.com/j.js",
    ],
    "extractLinks resolves + filters",
  );

  eq(normalizeUrl("imgs[i];", base), null, "JS array-index rejected");
  eq(normalizeUrl("/api?tpl=${x}", base), null, "template-literal rejected");

  const jsHtml = `
    <script src="/real.js"></script>
    <script>var imgs=['a.png']; el.src = imgs[i]; link.href="/fake";</script>
    <a href="/page">P</a>`;
  eq(
    extractLinks(jsHtml, base).sort(),
    ["https://example.com/page", "https://example.com/real.js"],
    "script body stripped, real attrs kept",
  );

  console.log(`\nself-test: ${pass} passed, ${fail} failed`);
  return fail === 0;
}

// ── CLI ──────────────────────────────────────────────────────────────

function parseArgs(args) {
  const opts = { ...DEFAULTS };
  const sites = [];
  let json = false;
  let test = false;
  for (const a of args) {
    if (a === "--self-test") test = true;
    else if (a === "--json") json = true;
    else if (a === "--no-external") opts.external = false;
    else if (a === "--external") opts.external = true;
    else if (a.startsWith("--max-pages=")) opts.maxPages = Number(a.split("=")[1]) || opts.maxPages;
    else if (a.startsWith("--concurrency=")) opts.concurrency = Number(a.split("=")[1]) || opts.concurrency;
    else if (a.startsWith("--timeout=")) opts.timeoutMs = Number(a.split("=")[1]) || opts.timeoutMs;
    else if (a.startsWith("http://") || a.startsWith("https://")) sites.push(a.replace(/\/+$/, "") + "/");
    else if (!a.startsWith("--")) console.warn(`(ignored arg: ${a})`);
  }
  return { opts, sites: sites.length ? sites : DEFAULT_SITES.map((s) => s + "/"), json, test };
}

async function main() {
  const { opts, sites, json, test } = parseArgs(argv.slice(2));

  if (test) {
    exit(selfTest() ? 0 : 1);
  }

  console.log(
    `Link crawler · ${sites.length} site(s) · concurrency ${opts.concurrency} · ` +
      `maxPages ${opts.maxPages} · external ${opts.external ? "on" : "off"}`,
  );

  const results = [];
  for (const site of sites) {
    results.push(await crawlSite(site, opts));
  }

  if (json) {
    console.log(JSON.stringify(results, null, 2));
    const hardFail = results.some((r) => r.brokenInternal.length > 0);
    exit(hardFail ? 1 : 0);
  }

  const hardFail = printReport(results);
  const totalBrokenInt = results.reduce((n, r) => n + r.brokenInternal.length, 0);
  const totalBrokenExt = results.reduce((n, r) => n + r.brokenExternal.length, 0);
  console.log(
    `\n${hardFail ? "❌" : "✅"} done — ${totalBrokenInt} broken internal, ${totalBrokenExt} broken external across ${results.length} site(s)`,
  );
  exit(hardFail ? 1 : 0);
}

main().catch((err) => {
  console.error("crawler crashed:", err);
  exit(1);
});
