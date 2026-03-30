"use client";

import { useCallback } from "react";

// Base64 encoded: "info@neckarshore.ai"
const E = "aW5mb0BuZWNrYXJzaG9yZS5haQ==";

export default function EmailObfuscator() {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const decoded = atob(E);
    window.location.href = `mailto:${decoded}`;
  }, []);

  return (
    <a
      id="email-link"
      href="#kontakt"
      onClick={handleClick}
      className="text-base font-medium text-accent transition-colors hover:text-accent-hover"
    >
      {/* Render as separate spans to confuse scrapers */}
      <span>info</span>
      <span>{"@"}</span>
      <span>neckarshore</span>
      <span>.</span>
      <span>ai</span>
    </a>
  );
}
