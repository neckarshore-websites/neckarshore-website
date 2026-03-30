"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-primary/10 bg-white/95 px-4 py-4 backdrop-blur-sm md:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Diese Website verwendet ausschließlich technisch notwendige Cookies.
          Keine Tracking-Cookies, keine Drittanbieter.{" "}
          <a href="/datenschutz" className="text-accent underline hover:text-accent-hover">
            Datenschutzerklärung
          </a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-dark"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
