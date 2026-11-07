"use client";

import { useEffect } from "react";

/**
 * Keeps the browser chrome tint (theme-color) equal to the background the page paints.
 *
 * A switch on the page decides the theme, not (only) the system, so a media-scoped tag alone
 * cannot know it. This reads the painted <body> background (the CSS token stays the only
 * source of the color) and writes it into every theme-color tag: once after hydration, again
 * whenever `data-theme` or the class on <html> changes, and after a background transition ends.
 */
export function ThemeColorSync() {
  useEffect(() => {
    const sync = () => {
      const color = getComputedStyle(document.body).backgroundColor;
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((tag) => tag.setAttribute("content", color));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    document.body.addEventListener("transitionend", sync);
    return () => {
      observer.disconnect();
      document.body.removeEventListener("transitionend", sync);
    };
  }, []);
  return null;
}
