/**
 * Unit tests for disclosure-config.json + scripts/sync-disclosure-config.sh.
 *
 * disclosure-config.json is the review-gated, committed copy of the private planning matrix
 * `disclosure` block (repo-attribution-matrix.yaml). Planning is private → never read cross-repo
 * at CI time, so this derived copy is hand-synced (v1) via the generator and asserted here:
 *
 *   1. committed == regenerated (byte-identical) — drift guard, matches the `jq -S` convention.
 *   2. HARD RULE — every `named_private` slug has a `display_overrides` entry, so a private repo
 *      can only ever be rendered as its product name, never its raw slug.
 *   3. shape / sort — exactly two fields, both `-S`-canonical (sorted).
 *
 * Run: npm run test:unit
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CONFIG = path.join(ROOT, "disclosure-config.json");
const GENERATOR = path.join(ROOT, "scripts", "sync-disclosure-config.sh");

const committedRaw = fs.readFileSync(CONFIG, "utf-8");
const committed = JSON.parse(committedRaw);

test("committed == regenerated (byte-identical, non-destructive --stdout)", () => {
  const res = spawnSync("bash", [GENERATOR, "--stdout"], { encoding: "utf-8" });
  assert.equal(res.status, 0, `generator failed:\n${res.stderr}`);
  assert.equal(
    res.stdout,
    committedRaw,
    "disclosure-config.json is stale — run `npm run sync:disclosure-config`",
  );
});

test("shape: exactly two fields — named_private (array) + display_overrides (object)", () => {
  assert.deepEqual(Object.keys(committed).sort(), ["display_overrides", "named_private"]);
  assert.ok(Array.isArray(committed.named_private), "named_private is an array");
  assert.equal(typeof committed.display_overrides, "object", "display_overrides is an object");
  assert.ok(!Array.isArray(committed.display_overrides));
});

test("HARD RULE: every named_private slug has a display_overrides entry", () => {
  for (const slug of committed.named_private) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(committed.display_overrides, slug),
      `named_private slug without a display_overrides entry (would leak raw): ${slug}`,
    );
    assert.ok(
      typeof committed.display_overrides[slug] === "string" && committed.display_overrides[slug].length > 0,
      `named_private slug maps to an empty product name: ${slug}`,
    );
  }
});

test("every slug is an owner/name pair (matches the withhold-script `.repo` shape)", () => {
  const slugs = [...committed.named_private, ...Object.keys(committed.display_overrides)];
  for (const slug of slugs) {
    assert.match(slug, /^[^/]+\/[^/]+$/, `not an owner/name slug: ${slug}`);
  }
});

test("-S canonical: named_private sorted A→Z, display_overrides keys sorted A→Z", () => {
  assert.deepEqual(committed.named_private, [...committed.named_private].sort(), "named_private not sorted");
  const keys = Object.keys(committed.display_overrides);
  assert.deepEqual(keys, [...keys].sort(), "display_overrides keys not sorted");
});

test("product display names never look like an owner/name slug (no raw-slug leak via a name)", () => {
  for (const [slug, name] of Object.entries(committed.display_overrides)) {
    assert.ok(!name.includes("/"), `display name for ${slug} looks like a slug: ${name}`);
  }
});
