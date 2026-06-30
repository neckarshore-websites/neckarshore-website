#!/usr/bin/env bash
# withhold-private-repos.sh — anonymize private repo names in the estate test-scope object.
#
# Runs AFTER scripts/aggregate-test-scope.sh, which deliberately keeps real owner/name slugs so
# its live-wins-by-slug dedup works. This script is the privacy seam: it takes the aggregated
# scope on stdin + the LIVE public-slug set as its arg, and withholds every slug-bearing field
# whose repo is NOT in that set. Output goes to stdout.
#
# Why at the source, not the render (#94 lesson): public/estate-test-scope.json is itself a
# public, fetchable asset (it feeds the indexable /test-management page) and `missing` rides
# into public/stats.json too — a render-only filter would be trivially bypassed by fetching the
# JSON. The withhold therefore lives in the data pipeline, before the file is written.
#
# Complete slug-bearing field set (verified against the emitted structure — everything else is a
# number / bool / timestamp / byType test-type key):
#   - per_repo[].repo  → "privates Repo", + private:true, + audited_sha:null (count/byType kept).
#   - missing[]        → "privates Repo" per private producer slug; LENGTH preserved so the
#                        reporting/expected gap stays readable (the count is the signal).
#
# Fail-safe by construction: a repo is kept ONLY if its slug is explicitly in the public set.
# Anything else — private, or a slug the live fetch never confirmed public — is withheld. The
# public set is derived upstream from the LIVE GitHub `.private` value (update-stats.yml), never
# the stats-config flag (which is for clone auth and can be stale).
#
# Top-level total/byType are never touched → the honest headline math is preserved. Output is
# `-S` key-sorted to match the aggregator's `jq -s -S`, so committed == cron output byte-for-byte.
#
# Usage:  withhold-private-repos.sh '<public-slugs-json-array>' < scope.json > anonymized.json
set -euo pipefail

PUBLIC="${1:?usage: withhold-private-repos.sh '<public-slugs-json-array>' < scope.json}"

jq -S --argjson pub "$PUBLIC" '
  .per_repo = ((.per_repo // []) | map(
    if (.repo as $r | $pub | index($r)) then .
    else (.repo = "privates Repo" | .private = true | .audited_sha = null)
    end
  ))
  | .missing = ((.missing // []) | map(
    if (. as $m | $pub | index($m)) then . else "privates Repo" end
  ))
'
