/**
 * The browser's opt-out signal: Global Privacy Control (`Sec-GPC: 1`) or
 * Do Not Track (`DNT: 1`).
 *
 * WHY (Art. 21(5) GDPR; DPO finding DS-NS-GPC-OBJECTION, 2026-10-05): the
 * visitor id changes every day and its salt is deleted, so we cannot recognise
 * a visitor who objects by mail and cannot stop counting their future visits.
 * The signal is the one objection that works without recognising anybody, so
 * both ends honour it: the browser script does not send, and the route does
 * not store when a request arrives anyway.
 *
 * No Node imports — this file is loaded by the browser script too.
 */

/** Server side: does the request carry the signal? */
export function hasOptOutSignal(headers: { get(name: string): string | null }): boolean {
  return headers.get("sec-gpc")?.trim() === "1" || headers.get("dnt")?.trim() === "1";
}

/** Browser side: is the signal switched on in this browser? */
export function browserOptedOut(): boolean {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string | null };
    return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
  } catch {
    return false;
  }
}
