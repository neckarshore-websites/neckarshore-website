#!/usr/bin/env bash
# withhold-private-repos.sh — apply the disclosure allow-list to the estate test-scope object.
#
# Runs AFTER scripts/aggregate-test-scope.sh, which deliberately keeps real owner/name slugs so
# its live-wins-by-slug dedup works. This script is the privacy seam: it takes the aggregated
# scope on stdin + the disclosure inputs as args, and decides per slug-bearing field how it is
# rendered in the PUBLIC output. Output goes to stdout.
#
# Why at the source, not the render (#94 lesson): public/estate-test-scope.json is itself a
# public, fetchable asset (it feeds the indexable /test-management page) and `missing` rides
# into public/stats.json too — a render-only filter would be trivially bypassed by fetching the
# JSON. The disclosure decision therefore lives in the data pipeline, before the file is written.
#
# 3-WAY disclosure (Pass-2a, disclosure-config wiring — Founder-signed 2026-07-01). Per slug $r,
# using the named-set (live_public ∪ named_private), the display_overrides map, and the
# named_private set:
#
#   1. $r in named-set + in overrides
#        · $r ALSO in named_private  → PRODUCT-NAME rewrite (.repo = overrides[$r]) + private:true
#                                       + audited_sha:null. The approved-private products are shown
#                                       by product name, NEVER their raw slug, and a private repo's
#                                       audited_sha is withheld (it leaks an internal ref).
#        · $r public (not private)   → PRODUCT-NAME rewrite (.repo = overrides[$r]); private/
#                                       audited_sha untouched (public — nothing to withhold).
#   2. $r in named-set, no override  → KEEP the raw slug (public non-product — Founder named all
#                                       public repos). private/audited_sha untouched.
#   3. $r NOT in named-set           → "privates Repo" + private:true + audited_sha:null (withhold).
#
# HARD RULE (fail-safe by construction, defence-in-depth — NOT relying on the generator alone):
# a named_private slug is rendered ONLY as its product name. If a named_private slug reaches here
# WITHOUT an override entry (malformed config), it is WITHHELD ("privates Repo"), never leaked raw.
# The only way a raw owner/name slug survives to the output is branch 2 — a PUBLIC repo. A private
# slug can therefore never appear raw. Public slugs may appear (Founder decision 2026-07-01).
#
# The same 3-way mapping is applied to missing[] (producer slugs; strings, no private/sha fields).
#
# Top-level total/byType are never touched → the honest headline math is preserved. Output is
# `-S` key-sorted to match the aggregator's `jq -s -S`, so committed == cron output byte-for-byte.
#
# Usage:
#   withhold-private-repos.sh '<named-set-array>' '<display-overrides-object>' '<named-private-array>' < scope.json > out.json
set -euo pipefail

NAMED="${1:?usage: withhold-private-repos.sh '<named-set-array>' '<overrides-object>' '<named-private-array>' < scope.json}"
OVERRIDES="${2:?missing display-overrides object (arg 2)}"
NAMED_PRIVATE="${3:?missing named-private array (arg 3)}"

jq -S \
  --argjson named "$NAMED" \
  --argjson ov "$OVERRIDES" \
  --argjson priv "$NAMED_PRIVATE" '
  # --- per-repo object: decide .repo (+ .private/.audited_sha) for one slug ---
  def disclose_repo:
    .repo as $r
    | if ($named | index($r)) then
        if ($priv | index($r)) then
          # named_private: MUST be a product name; fail-closed to withhold if no override.
          if ($ov | has($r)) then (.repo = $ov[$r] | .private = true | .audited_sha = null)
          else (.repo = "privates Repo" | .private = true | .audited_sha = null)
          end
        else
          # public repo: slug allowed; apply the display override for board consistency if present.
          (if ($ov | has($r)) then (.repo = $ov[$r]) else . end)
        end
      else
        # not in the named set → withhold.
        (.repo = "privates Repo" | .private = true | .audited_sha = null)
      end;

  # --- missing[] entry: same 3-way, but the element is a bare slug string ---
  def disclose_missing:
    . as $m
    | if ($named | index($m)) then
        if ($priv | index($m)) then
          (if ($ov | has($m)) then $ov[$m] else "privates Repo" end)
        else
          (if ($ov | has($m)) then $ov[$m] else $m end)
        end
      else "privates Repo"
      end;

  .per_repo = ((.per_repo // []) | map(disclose_repo))
  | .missing = ((.missing // []) | map(disclose_missing))
'
