"use client";

import { useEffect } from "react";

// Umami's tracker, loaded only when its before-send hook is present
// (planning #4006 row 6; carried over from neckarshore-website #389).
//
// The hook (/umami-before-send.js) loads beforeInteractive, so it has run before
// React hydrates. If that request failed, window.umamiBeforeSend is missing, and
// Umami v3.4.1 would then send its payload unfiltered (src/tracker/index.ts:387-395):
// screen size, the full query string, and a send under Global Privacy Control
// (data-do-not-track covers DNT only). So without the hook the tracker is not
// loaded at all: fail closed, count nothing.
export default function UmamiTracker({ host, websiteId }: { host: string; websiteId: string }) {
  useEffect(() => {
    const w = window as Window & { umamiBeforeSend?: unknown };
    if (typeof w.umamiBeforeSend !== "function") return;
    const src = `${host}/script.js`;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.websiteId = websiteId;
    script.dataset.beforeSend = "umamiBeforeSend";
    script.dataset.doNotTrack = "true";
    script.dataset.excludeHash = "true";
    document.body.appendChild(script);
  }, [host, websiteId]);
  return null;
}
