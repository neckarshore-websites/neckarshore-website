/**
 * Block 3 of /test-management (#370): the committed reasons file is a fresh run of its generator,
 * it adds up to the repositories without a count, and only released names appear as rows.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  groupSize,
  loadAllRepos,
  loadScopeReasons,
  reasonsAddUp,
  type ScopeReasons,
} from "../../src/lib/test-scope-reasons";
import { loadEstateScope } from "../../src/lib/test-page-data";

test("the committed reasons file is byte-identical to a fresh generator run", () => {
  const fresh = execFileSync(
    "bash",
    ["scripts/sync-test-scope-reasons.sh", "--stdout"],
    {
      encoding: "utf8",
    },
  );
  assert.equal(readFileSync("public/test-scope-reasons.json", "utf8"), fresh);
});

test("the groups add up to all repositories minus the counted ones (committed data)", () => {
  const reasons = loadScopeReasons();
  const all = loadAllRepos();
  const counted = loadEstateScope().repos;
  const sum = reasons.groups.reduce((a, g) => a + groupSize(g), 0);
  assert.equal(sum, all - counted, `groups ${sum} vs ${all} − ${counted}`);
  assert.ok(reasonsAddUp(reasons, all, counted));
});

test("a moved number makes the block fall back instead of showing wrong sums", () => {
  const reasons = loadScopeReasons();
  const all = loadAllRepos();
  const counted = loadEstateScope().repos;
  assert.equal(reasonsAddUp(reasons, all + 1, counted), false);
  assert.equal(reasonsAddUp(reasons, all, counted + 1), false);
});

test("rows name only public repositories or released products, never a private slug", () => {
  const reasons: ScopeReasons = loadScopeReasons();
  const disclosure = JSON.parse(readFileSync("disclosure-config.json", "utf8"));
  const config = JSON.parse(readFileSync("stats-config.json", "utf8"))
    .repos as {
    owner: string;
    name: string;
    private?: boolean;
  }[];
  const released = new Set<string>(Object.values(disclosure.display_overrides));
  const privateSlugs = config
    .filter((r) => r.private)
    .map((r) => `${r.owner}/${r.name}`);
  const publicNames = new Set(
    config
      .filter((r) => !r.private)
      .flatMap((r) => [r.name, `${r.owner}/${r.name}`]),
  );
  const text = JSON.stringify(reasons);
  for (const slug of privateSlugs)
    assert.ok(!text.includes(slug), `private slug ${slug} in the file`);
  for (const g of reasons.groups) {
    for (const r of g.rows) {
      assert.ok(
        released.has(r.name) || publicNames.has(r.name),
        `${r.name} is neither public nor a released product name`,
      );
    }
  }
});
