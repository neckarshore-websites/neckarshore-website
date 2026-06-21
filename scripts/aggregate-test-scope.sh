#!/usr/bin/env bash
# aggregate-test-scope.sh — roll up per-repo stats.json files into the estate test-scope object.
#
# Pure aggregation (dir-in → JSON-out): given a stats-config.json (repos[] with an optional
# statsPath each) and a directory of already-fetched per-repo stats.json files, it sums the
# additive estate contribution and emits the decomposed estate test-scope object on stdout.
#
# The fetch (curl over the GitHub contents API) deliberately lives in the caller
# (.github/workflows/update-stats.yml), so THIS file — the bug-prone jq logic — is the exact
# code path the unit test exercises (tests/unit/aggregate-test-scope.test.mjs). Separation of
# concerns: network I/O in YAML, no-double-count math here.
#
# No-double-count contract (docs/reference/stats-json-contract.md):
#   - .tests.total and .tests.byType are ADDITIVE (distinct runner totals; sum(byType)==total).
#   - .tests.lenses are OVERLAPPING, display-only subsets — NEVER summed into total or byType.
# Fail-closed-visible:
#   - a repo with a statsPath whose file is absent/unparseable contributes 0, emits a WARN on
#     stderr, and lands in missing[]. Never a silent 0.
# Fail-soft (rollout window):
#   - a producer with a numeric .tests.total but no .tests.byType (the live omnopsis-backend
#     OLD shape, before the Task-1 producer lands) still contributes its total; byType → {}.
#
# Usage:  aggregate-test-scope.sh <stats-config.json> <stats-dir>
#   stats-dir holds one file per fetched producer, named "<owner>__<name>.json".
# Output: estate test-scope JSON on stdout (no updatedAt — the caller stamps that).
set -euo pipefail

CONFIG="${1:?usage: aggregate-test-scope.sh <stats-config.json> <stats-dir>}"
STATS_DIR="${2:?usage: aggregate-test-scope.sh <stats-config.json> <stats-dir>}"

# Expected producers = repos that declare a statsPath. A repo with no statsPath is simply not
# yet a producer (expected during the Plan 3 rollout) and is not counted in `expected`.
EXPECTED=$(jq '[.repos[] | select(.statsPath != null)] | length' "$CONFIG")

PER_REPO_FILE=$(mktemp)
MISSING_FILE=$(mktemp)
trap 'rm -f "$PER_REPO_FILE" "$MISSING_FILE"' EXIT

while IFS=$'\t' read -r OWNER NAME SLUG; do
  FILE="${STATS_DIR}/${OWNER}__${NAME}.json"

  # Valid iff the file exists AND carries a numeric .tests.total (works for both the old
  # {tests:{total}} shape and the new {tests:{total,byType}} contract shape).
  if [ ! -f "$FILE" ] || ! jq -e '.tests.total | numbers' "$FILE" >/dev/null 2>&1; then
    echo "WARN: ${SLUG} — stats.json absent or unparseable (no numeric .tests.total); contributing 0" >&2
    printf '%s\n' "$SLUG" >> "$MISSING_FILE"
    continue
  fi

  # Normalize the per-repo contribution. byType/lenses/endpoints degrade gracefully if absent.
  jq -c --arg slug "$SLUG" '{
    repo: (.repo // $slug),
    audited_sha: (.audited_sha // null),
    total: .tests.total,
    byType: (.tests.byType // {}),
    lenses: (.tests.lenses // {}),
    endpoints: (.endpoints // 0)
  }' "$FILE" >> "$PER_REPO_FILE"
done < <(jq -r '.repos[] | select(.statsPath != null) | [.owner, .name, (.owner + "/" + .name)] | @tsv' "$CONFIG")

MISSING_JSON=$(sort "$MISSING_FILE" | jq -R . | jq -s .)

# Aggregate: total = Σ .total; byType = merge-add per key; endpoints = Σ .endpoints.
# lenses are intentionally NOT aggregated (they overlap and would double-count) — they remain
# per-repo, display-only, inside repos[] for Plan 2's Obsidian per-repo breakdown.
jq -s -S \
  --argjson expected "$EXPECTED" \
  --argjson missing "$MISSING_JSON" \
  '{
    total: ([.[].total] | add // 0),
    byType: (reduce .[].byType as $b ({}; reduce ($b | to_entries[]) as $e (.; .[$e.key] = ((.[$e.key] // 0) + $e.value)))),
    endpoints: ([.[].endpoints] | add // 0),
    reporting: length,
    expected: $expected,
    missing: $missing,
    repos: .
  }' "$PER_REPO_FILE"
