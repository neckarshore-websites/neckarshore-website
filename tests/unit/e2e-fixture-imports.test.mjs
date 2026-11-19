// Every e2e spec must take `test` from ./fixtures (or ./site-test, which
// extends it). Only then does the Umami stub answer stats.neckarshore.ai, so
// no e2e run, local or CI, loads the real tracker or counts on the box.
// A spec that imports `test` straight from "@playwright/test" bypasses it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../e2e/", import.meta.url);
const specs = readdirSync(dir).filter((f) => f.endsWith(".spec.ts"));

test("there are e2e specs to check", () => {
  assert.ok(specs.length > 10, `only ${specs.length} specs found in tests/e2e`);
});

test("no e2e spec imports from @playwright/test directly", () => {
  const offenders = specs.filter((f) =>
    // `import type` is erased at compile time and cannot bypass the stub.
    /^\s*import\s+(?!type\s)[^;]*from\s+["']@playwright\/test["']/m.test(readFileSync(new URL(f, dir), "utf8")),
  );
  assert.deepEqual(offenders, [], `import test/expect from "./fixtures" instead in: ${offenders.join(", ")}`);
});

test("site-test.ts builds on ./fixtures", () => {
  const src = readFileSync(new URL("site-test.ts", dir), "utf8");
  assert.match(src, /from\s+["']\.\/fixtures["']/);
});
