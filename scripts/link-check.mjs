#!/usr/bin/env node

/**
 * External-link liveness check — weekly cron, CLASSIFY (not pass/fail).
 *
 * Leg-3 of the test-coverage package (L-TEST-COVERAGE-PACKAGE). Distinct from
 * `link-crawler.mjs`: that one recurses INTERNAL pages to hunt 404s on demand;
 * THIS one fetches each site's SSR HTML once, collects the EXTERNAL links it
 * server-renders, and classifies their liveness so a third-party going dark
 * files a GitHub issue — without false-firing on datacenter-IP bot-blocks.
 *
 * Classification (the hard requirement — never false-fire on a bot-block):
 *   alive   200–399                          → fine, no action
 *   dead    404 · 410 · ENOTFOUND · ECONNREFUSED  → genuinely gone → ISSUE
 *   unsure  403 · 429 · 408 · other-4xx · 5xx · timeout · unknown
 *                                            → retried; if still unsure → WARN only
 *
 * Datacenter IPs get 403/429'd by Cloudflare-fronted hosts (LinkedIn, etc.).
 * Those are `unsure`, never `dead` — they never open an issue. Only a link that
 * is provably gone (404/410) or whose host no longer resolves (DNS) is `dead`.
 *
 * Soft-block exception: a few consumer platforms (delivery apps, etc.) serve a
 * hard 404/410 to datacenter IPs while the page is alive for real users — a
 * 404-shaped bot-block. Hosts in `CONFIG.softBlockDomains` get their `dead`
 * verdict downgraded to `unsure` so they never false-fire. The list is
 * evidence-seeded (ubereats: 404 from CI, 307→200 from a German IP), never
 * speculative.
 *
 * SSR-discovery limit (acknowledged, fine for static marketing pages): a raw
 * `fetch` sees only the server-rendered HTML, so client-only links would be
 * missed. Our marketing sites render their links server-side, so this is
 * complete in practice — and honest about its scope.
 *
 * Config-shaped on purpose (AP-1): `CONFIG` + the pure helpers below are the
 * lift-and-shift surface. When a 2nd site grows external links and this earns
 * promotion into the shared `site-quality` package, you MOVE `classify` +
 * `checkUrl` + `externalLinksFrom` and leave `CONFIG` with the consumer —
 * an ADD/MOVE, not a REWRITE.
 *
 * Zero new deps — Node 20+ global fetch, reusing the crawler's SSR-href scan.
 *
 * Usage:
 *   node scripts/link-check.mjs              human report + writes report JSON
 *   node scripts/link-check.mjs --json       machine-readable report to stdout
 *   node scripts/link-check.mjs --self-test  offline unit test of classify()
 *
 * Exit codes:
 *   0  ran to completion (dead links are signalled via the report/issue, NOT
 *      via red CI — third-party rot is not our build failing)
 *   1  --self-test assertion failed, or the run crashed
 */

import { argv, exit } from "node:process";
import { writeFileSync } from "node:fs";
import { extractLinks, isInternal } from "./link-crawler.mjs";

// ── Config — the lift-and-shift surface ──────────────────────────────

const CONFIG = {
  // Per site: which SSR pages to scan for external links. Today only
  // neckarshore renders external links (EU-ODR, Calendly, social); the other
  // three are listed so they are covered the moment they grow one.
  sites: [
    { origin: "https://neckarshore.ai", pages: ["/", "/impressum", "/datenschutz"] },
    { origin: "https://oakwoodgolfclub.de", pages: ["/"] },
    { origin: "https://ristorante-goldoni.de", pages: ["/"] },
    { origin: "https://rauhut.com", pages: ["/"] },
  ],
  timeoutMs: 15000,
  retries: 2, // extra attempts after the first, with backoff, before giving up
  backoffMs: 1500, // grows linearly per retry — gentle, never tight-polls a host
  userAgent: "neckarshore-link-check/1.0 (+https://neckarshore.ai)",
  reportPath: "link-check-report.json",
  // Consumer platforms that geo/bot-gate by IP: they serve a hard 404/410 to
  // datacenter IPs (GitHub Actions) while the page is alive for real users.
  // A `dead` verdict on these hosts is downgraded to `unsure` so the cron never
  // false-fires on a link that works. Evidence-seeded — add a host ONLY when a
  // run proves it false-deads (e.g. ubereats: 404 from CI, 307→200 from a DE IP).
  softBlockDomains: ["ubereats.com"],
};

const DEAD_ERRORS = new Set(["ENOTFOUND", "ECONNREFUSED"]);

// ── Pure helpers (unit-tested via --self-test) ───────────────────────

/**
 * Map a probe result to a liveness verdict. The single source of truth for
 * "is this link actually broken, or just bot-blocked?".
 *   status   the HTTP status (0 if the request never completed)
 *   errCode  the network error code/name when status is 0 (else null)
 */
export function classify(status, errCode) {
  if (status >= 200 && status <= 399) return "alive";
  if (status === 404 || status === 410) return "dead";
  if (DEAD_ERRORS.has(errCode)) return "dead";
  return "unsure"; // 403 / 429 / 408 / other-4xx / 5xx / timeout / unknown
}

/** True if `url`'s host is (a subdomain of) a known geo/bot-gating platform. */
export function isSoftBlockHost(url, softBlockDomains = []) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  return softBlockDomains.some((d) => host === d || host.endsWith(`.${d}`));
}

/**
 * Final verdict = the raw classify() contract, with one policy layer on top:
 * a `dead` on a known geo/bot-gated host is downgraded to `unsure`, because a
 * 404/410 from a datacenter IP there is a soft-block, not a removed page.
 */
export function verdictFor(url, status, errCode, softBlockDomains = []) {
  const v = classify(status, errCode);
  if (v === "dead" && isSoftBlockHost(url, softBlockDomains)) return "unsure";
  return v;
}

/** External links server-rendered on `html` — same scan as the crawler, minus same-origin. */
export function externalLinksFrom(html, origin) {
  return extractLinks(html, origin).filter((link) => !isInternal(link, origin));
}

// ── Network ──────────────────────────────────────────────────────────

/** Single probe → { status, errCode }. GET (HEAD is unreliable on many hosts). */
async function probeOnce(url, opts) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": opts.userAgent },
    });
    return { status: res.status, errCode: null };
  } catch (err) {
    return { status: 0, errCode: err.name === "AbortError" ? "timeout" : err.code || err.name };
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Probe with retry/backoff. Retries EVERY non-alive result (dead included) so a
 * transient DNS blip or 503 cannot mislabel a healthy link — the verdict is the
 * classification of the FINAL attempt; an alive on any attempt short-circuits.
 */
async function checkUrl(url, opts) {
  let last;
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    if (attempt > 0) await sleep(opts.backoffMs * attempt);
    last = await probeOnce(url, opts);
    if (classify(last.status, last.errCode) === "alive") break;
  }
  return {
    url,
    status: last.status,
    errCode: last.errCode,
    verdict: verdictFor(url, last.status, last.errCode, opts.softBlockDomains),
  };
}

/** Fetch one page's SSR HTML, or null (logged) if it can't be read. */
async function fetchHtml(url, opts) {
  const res = await probeOnceHtml(url, opts);
  if (!res.ok) {
    console.warn(`   ⚠️  could not read ${url} (${res.status || res.errCode}) — skipping its links`);
    return null;
  }
  return res.body;
}

async function probeOnceHtml(url, opts) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "user-agent": opts.userAgent } });
    return { ok: res.ok, status: res.status, body: res.ok ? await res.text() : null };
  } catch (err) {
    return { ok: false, status: 0, errCode: err.name === "AbortError" ? "timeout" : err.code || err.name };
  } finally {
    clearTimeout(timer);
  }
}

// ── Discover → check ─────────────────────────────────────────────────

/** Collect every unique external URL across all configured pages → Map(url → Set(foundOn)). */
async function discover(config) {
  const found = new Map();
  for (const site of config.sites) {
    for (const path of site.pages) {
      const pageUrl = new URL(path, site.origin).toString();
      const html = await fetchHtml(pageUrl, config);
      if (!html) continue;
      for (const link of externalLinksFrom(html, site.origin)) {
        if (!found.has(link)) found.set(link, new Set());
        found.get(link).add(pageUrl);
      }
    }
  }
  return found;
}

async function run(config) {
  console.log(`Link check · ${config.sites.length} site(s) · external liveness · retries ${config.retries}`);
  const found = await discover(config);
  const urls = [...found.keys()].sort();
  console.log(`Discovered ${urls.length} unique external link(s) across the SSR HTML.\n`);

  const checked = [];
  for (const url of urls) {
    const r = await checkUrl(url, config);
    r.foundOn = [...found.get(url)];
    checked.push(r);
    const icon = r.verdict === "alive" ? "✅" : r.verdict === "dead" ? "❌" : "⚠️ ";
    const code = r.status === 0 ? `ERR:${r.errCode}` : `HTTP ${r.status}`;
    console.log(`   ${icon} [${r.verdict}] ${code}  ${url}`);
  }

  const dead = checked.filter((r) => r.verdict === "dead");
  const unsure = checked.filter((r) => r.verdict === "unsure");
  const report = {
    checkedAt: new Date().toISOString(),
    totals: { checked: checked.length, alive: checked.length - dead.length - unsure.length, dead: dead.length, unsure: unsure.length },
    dead,
    unsure,
  };
  return report;
}

// ── Self-test (offline; the classify contract is the safety net) ─────

function selfTest() {
  let pass = 0;
  let fail = 0;
  const eq = (got, want, label) => {
    if (got === want) pass++;
    else {
      fail++;
      console.error(`  ✗ ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
  };

  // alive band
  eq(classify(200), "alive", "200 alive");
  eq(classify(301), "alive", "301 alive");
  eq(classify(399), "alive", "399 alive");
  // dead → issue
  eq(classify(404), "dead", "404 dead");
  eq(classify(410), "dead", "410 dead");
  eq(classify(0, "ENOTFOUND"), "dead", "DNS ENOTFOUND dead");
  eq(classify(0, "ECONNREFUSED"), "dead", "ECONNREFUSED dead");
  // unsure → retry, warn-only (the bot-block guard)
  eq(classify(403), "unsure", "403 bot-block unsure");
  eq(classify(429), "unsure", "429 rate-limit unsure");
  eq(classify(408), "unsure", "408 unsure");
  eq(classify(400), "unsure", "other-4xx unsure");
  eq(classify(418), "unsure", "teapot unsure");
  eq(classify(500), "unsure", "500 unsure");
  eq(classify(503), "unsure", "503 unsure");
  eq(classify(0, "timeout"), "unsure", "timeout unsure");
  eq(classify(0, "EAI_AGAIN"), "unsure", "transient DNS EAI_AGAIN unsure");
  eq(classify(0, null), "unsure", "unknown failure unsure");

  // soft-block downgrade (the datacenter-IP geo-gate guard)
  const sb = ["ubereats.com"];
  eq(verdictFor("https://www.ubereats.com/de/store/x", 404, null, sb), "unsure", "soft-block 404 → unsure");
  eq(verdictFor("https://www.ubereats.com/x", 200, null, sb), "alive", "soft-block 200 stays alive");
  eq(verdictFor("https://ristorante-goldoni.de/gone", 404, null, sb), "dead", "normal-host 404 stays dead");
  eq(verdictFor("https://x.com/y", 404, null, []), "dead", "empty soft-block list → 404 dead");
  eq(isSoftBlockHost("https://deliveroo.ubereats.com/x", sb), true, "soft-block matches subdomain");
  eq(isSoftBlockHost("https://notubereats.com/x", sb), false, "soft-block does not match lookalike host");

  // external filtering
  const html = `<a href="/internal">x</a><a href="https://calendly.com/x">c</a><link href="https://fonts.example/f.css"><a href="mailto:a@b.de">m</a>`;
  const ext = externalLinksFrom(html, "https://neckarshore.ai").sort();
  eq(JSON.stringify(ext), JSON.stringify(["https://calendly.com/x", "https://fonts.example/f.css"]), "externalLinksFrom keeps external, drops internal+mailto");

  console.log(`\nself-test: ${pass} passed, ${fail} failed`);
  return fail === 0;
}

// ── CLI ──────────────────────────────────────────────────────────────

async function main() {
  const args = argv.slice(2);
  if (args.includes("--self-test")) exit(selfTest() ? 0 : 1);

  const report = await run(CONFIG);

  writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));

  if (args.includes("--json")) {
    console.log("\n" + JSON.stringify(report, null, 2));
  }

  const { dead, unsure, checked } = report.totals;
  console.log(
    `\n${dead > 0 ? "❌" : "✅"} done — ${checked} external link(s): ` +
      `${report.totals.alive} alive, ${dead} dead, ${unsure} unsure (bot-block/transient). ` +
      `Report → ${CONFIG.reportPath}`,
  );
  if (dead > 0) console.log(`   ${dead} dead link(s) → the cron files/updates a GitHub issue.`);

  // Always exit 0 on a completed run: dead links are signalled via the issue,
  // not via red CI. A non-zero exit is reserved for our own failures.
  exit(0);
}

main().catch((err) => {
  console.error("link-check crashed:", err);
  exit(1);
});
