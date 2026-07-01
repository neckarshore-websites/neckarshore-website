#!/usr/bin/env bash
# check-private-slug-leak.sh — durable CI gate: NO private repo slug in any SERVED public artifact.
#
# Backlog #267 (T-public-artifact-private-slug-ci-gate). The systemic answer to the private-name
# leak class that kept recurring one surface removed: render-filter → served repositories.json
# (#94) → estate-test-scope.json + its missing[] + the Actions log (#95). Each patch was correct
# but reactive; this gate fails the PR before a new SERVED artifact can leak a private slug.
#
# SCOPE — what this gate scans, and why (the served-vs-config line, per the disclosure-config PIR):
#   · SCANS  the SERVED surface: every file under `public/` (Next serves these at URLs; crawlers
#     fetch + index them — this is where #94/#95 actually leaked). "privates Repo", product display
#     names, and public slugs are all fine; a raw PRIVATE owner/name slug is the defect.
#   · DOES NOT scan the build-config SOURCES (stats-config.json · disclosure-config.json ·
#     estate-test-scope-seed.json). They list private slugs BY DESIGN — stats-config is clone-
#     discovery, disclosure-config is the private→product-name map, the seed is the floor. They are
#     this gate's authoritative SOURCE-OF-TRUTH for "what is private", not a leak surface: they are
#     git-source only (never served at a URL, never crawlable). Their git-source exposure of private
#     repo NAMES is a separate, narrower question (a policy/infra decision — private discovery
#     config), tracked apart from this gate. Scrubbing one (e.g. the seed) while stats-config remains
#     buys zero git-source privacy and breaks live-wins-by-slug dedup — so this gate does NOT do that.
#
# KNOWN-PRIVATE SET (deterministic, no network, fail-closed):
#   known_private = (all stats-config slugs) − (LIVE-public slugs from public/repositories.json)
#                   ∪ disclosure-config.json.named_private
#   The complement-of-live-public is the fail-safe source: a slug the last cron did NOT confirm
#   live-public is treated as private. This is why a stale stats-config `.private` flag can't cause
#   a false positive — e.g. clearpath-52 (`private:true` in stats-config but LIVE-public) is in
#   repositories.json, so it is correctly EXCLUDED from known_private and may appear named.
#   (Do NOT union stats-config `.private==true` — that would re-introduce the clearpath false red.)
#
# Usage:
#   scripts/check-private-slug-leak.sh [scan-dir]   # scan-dir default: public
#   npm run check:privacy
set -euo pipefail

cd "$(dirname "$0")/.."

SCAN_DIR="${1:-public}"
STATS_CONFIG="stats-config.json"
REPOS_JSON="public/repositories.json"
DISCLOSURE="disclosure-config.json"

for f in "$STATS_CONFIG" "$REPOS_JSON" "$DISCLOSURE"; do
  [ -f "$f" ] || { echo "FATAL: missing required source $f" >&2; exit 2; }
done
[ -d "$SCAN_DIR" ] || { echo "FATAL: scan dir $SCAN_DIR not found" >&2; exit 2; }

# known_private = (stats-config − live-public) ∪ named_private, one owner/name slug per line, A→Z.
PATTERNS="$(mktemp)"
trap 'rm -f "$PATTERNS"' EXIT
jq -r --slurpfile repos "$REPOS_JSON" --slurpfile disc "$DISCLOSURE" '
  ([$repos[0].repos[] | "\(.owner)/\(.name)"]) as $public
  | ([.repos[] | "\(.owner)/\(.name)"]) as $universe
  | ($universe - $public) + $disc[0].named_private
  | unique | .[]
' "$STATS_CONFIG" > "$PATTERNS"

COUNT=$(wc -l < "$PATTERNS" | tr -d ' ')
if [ "$COUNT" -eq 0 ]; then
  echo "WARN: known-private set is empty — nothing to check (every stats-config repo is live-public?)." >&2
  exit 0
fi

echo "check-private-slug-leak: scanning $SCAN_DIR/ against ${COUNT} known-private slugs (build-config is SOURCE, not scanned)."

# grep -F (fixed strings), -I (skip binary assets), -r (recursive), -n (line). Exit 0 = a match was
# found = a LEAK. Guarded so `set -e` does not treat grep's no-match exit(1) as a script failure.
if MATCHES=$(grep -rIFn -f "$PATTERNS" "$SCAN_DIR" 2>/dev/null); then
  echo "FATAL: private repo slug(s) leaked into a SERVED artifact under $SCAN_DIR/:" >&2
  echo "$MATCHES" >&2
  echo "" >&2
  echo "A private owner/name slug must never appear raw in a served file. If a repo legitimately" >&2
  echo "went public, it will be in public/repositories.json (a deliberate review trigger). If it is" >&2
  echo "an approved-private product, it must render as its product name (disclosure-config.json)." >&2
  exit 1
fi

echo "OK: no private repo slug in any served file under $SCAN_DIR/."
