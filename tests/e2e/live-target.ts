/**
 * Is the page we just loaded actually neckarshore.ai — or something standing in front of it?
 *
 * WHY THIS EXISTS (L-NECK-LIVE-PRUEFUNGEN-UNZUVERLAESSIG). On 2026-08-22 a live fetch of
 * neckarshore.ai returned Vercel's automatic "Security Checkpoint" instead of the site: curl
 * got HTTP 200 with a 34 KB challenge page, Playwright got 403. Nobody had switched anything
 * on — the mitigation decides per traffic pattern and was gone hours later. The dangerous part
 * is that "HTTP 200 plus different HTML" is, for a test, indistinguishable from "the page
 * changed": a smoke run against production then fails (or passes a bare status check) for a
 * reason that has nothing to do with the code.
 *
 * WHAT IT CHECKS — positive identity, not a blocklist. The deciding question is "is this our
 * page?", answered by the Organization @id that the root layout ships in its JSON-LD on every
 * route. It is IMPORTED from the schema source, not written here, so renaming the anchor
 * cannot leave this guard pinned to a stale literal. The checkpoint title is only used to make
 * the failure message specific; any other interstitial fails the identity check all the same.
 *
 * Pure function, no Playwright import — unit-tested in tests/unit/live-target.test.ts.
 */
import { ORG_ID } from "../../src/lib/schema/organization";

/** Title of Vercel's challenge page, as measured on 2026-08-22. Used for the message only. */
export const VERCEL_CHECKPOINT_TITLE = "Vercel Security Checkpoint";

/** The identity anchor every route of the site carries (root-layout JSON-LD). */
export const SITE_IDENTITY_MARKER = ORG_ID;

/** Prefix of every failure this guard raises — grep for it in a red run. */
export const GUARD_PREFIX = "LIVE-TARGET-GUARD";

export type TargetVerdict = { ok: true } | { ok: false; reason: string };

export function classifyTargetResponse(
  url: string,
  status: number,
  body: string,
): TargetVerdict {
  if (body.includes(VERCEL_CHECKPOINT_TITLE)) {
    return {
      ok: false,
      reason:
        `${GUARD_PREFIX}: ${url} answered with Vercel's Security Checkpoint (HTTP ${status}), ` +
        `not with the site. This run measured the defence page, not the code — ` +
        `nothing about the site follows from it. Retry later, or test the build locally.`,
    };
  }
  if (!body.includes(SITE_IDENTITY_MARKER)) {
    return {
      ok: false,
      reason:
        `${GUARD_PREFIX}: ${url} (HTTP ${status}, ${body.length} bytes) does not carry the ` +
        `site's identity anchor ${SITE_IDENTITY_MARKER}. Whatever answered is not ` +
        `neckarshore.ai as built — check the target before reading any test result.`,
    };
  }
  return { ok: true };
}
