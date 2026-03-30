"use client";

import { useEffect, useRef } from "react";

function track(event: string, data?: Record<string, unknown>) {
  try {
    navigator.sendBeacon(
      "/api/track",
      JSON.stringify({
        event,
        page: window.location.pathname,
        referrer: document.referrer || null,
        device: window.innerWidth < 768 ? "mobile" : "desktop",
        timestamp: new Date().toISOString(),
        ...data,
      })
    );
  } catch {
    // silently fail — tracking is non-critical
  }
}

export default function TrackerScript() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Page view
    track("page_view");

    // Scroll depth
    const thresholds = [25, 50, 75, 100];
    const fired = new Set<number>();

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const t of thresholds) {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          track("scroll_depth", { depth: t });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // CTA clicks
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-track]");
      if (target) {
        track("cta_click", {
          action: target.getAttribute("data-track"),
        });
      }
    };

    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
