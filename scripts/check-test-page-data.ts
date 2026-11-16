/**
 * check-test-page-data.ts — the /test-management sum check, run on the data files directly.
 *
 * update-stats.yml runs this BEFORE it commits the daily stats to main. The page runs the same
 * check while it is prerendered, so a broken sum would otherwise reach main and fail every
 * deploy after it; here it stops the stats job instead, and the job's outage report fires.
 *
 * Usage: npx tsx scripts/check-test-page-data.ts [repo-root]   (exit 1 on a mismatch)
 */
import fs from "node:fs";
import path from "node:path";
import { assertTestPageData, loadEstateScope, loadTileScope } from "../src/lib/test-page-data";

const root = path.resolve(process.argv[2] ?? process.cwd());
const disclosure = JSON.parse(fs.readFileSync(path.join(root, "disclosure-config.json"), "utf-8"));

try {
  const scope = loadEstateScope(root);
  const { grand } = assertTestPageData(scope, loadTileScope(root), disclosure.display_overrides);
  console.log(`test page data OK: ${grand.total} tests in ${scope.repos} repositories add up`);
} catch (err) {
  console.error(`::error::${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
