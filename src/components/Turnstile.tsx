"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile — Client-Widget (privacy-friendly CAPTCHA).
 *
 * Mount-Komponente für das Turnstile-Widget. Lädt das Cloudflare-Script
 * dynamisch im Browser (kein SSR, kein Bundle-Impact wenn der Flag aus ist),
 * rendert das Widget explizit und hängt — durch Cloudflare selbst — ein
 * hidden input `cf-turnstile-response` in die umschließende <form>.
 *
 * Family-Captcha-Standard (D-LIN-OAK-TURNSTILE): von oakwood/goldoni nach
 * neckarshore.ai portiert (2026-06-12). Kostenlos + unbegrenzt, DSGVO-konform
 * (kein Cookie, kein Cross-Site-Tracking), unsichtbar/non-interactive im
 * Normalfall. Server-Verifikation: lib/captcha/verify.ts (siteverify).
 *
 * Feature-Flag (dormant bis zur Aktivierung):
 *   - `NEXT_PUBLIC_CAPTCHA_ENABLED !== "true"` → Widget rendert null, kein
 *     Script-Load, kein Bundle-Impact. Spam-Schutz kommt dann allein aus dem
 *     Honeypot-Feld in der Server Action (src/app/actions/inquiry.ts).
 *   - Aktivierung = BEIDE Envs auf "true" (client `NEXT_PUBLIC_CAPTCHA_
 *     ENABLED` + server `CAPTCHA_ENABLED`) plus die beiden Keys
 *     (`NEXT_PUBLIC_TURNSTILE_SITEKEY` + `TURNSTILE_SECRET_KEY`).
 *
 * Graceful degradation: Flag an, aber Sitekey fehlt → nichts rendern, Form
 * bleibt submit-fähig (Spiegelbild der Server-Seite in verify.ts).
 *
 * CSP: das Script + der Challenge-iframe + die Challenge-Fetches laufen alle
 * gegen https://challenges.cloudflare.com — entsprechend in next.config.ts
 * unter script-src / frame-src / connect-src freigegeben.
 */

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      language?: string;
      theme?: "auto" | "light" | "dark";
      action?: string;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Load the Turnstile script exactly once; resolve when window.turnstile is ready. */
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
  );
  if (existing) {
    if (window.turnstile) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("turnstile-script-error")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile-script-error"));
    document.head.appendChild(script);
  });
}

export function Turnstile() {
  const captchaEnabled = process.env.NEXT_PUBLIC_CAPTCHA_ENABLED === "true";
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!captchaEnabled || !sitekey || !mountRef.current) return;

    let cancelled = false;
    let widgetId: string | null = null;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !mountRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(mountRef.current, {
          sitekey,
          language: "de",
          theme: "auto",
        });
      })
      .catch(() => {
        // Script blocked / offline — fail open on the client; the server
        // (verify.ts) is the authoritative gate when the flag is on.
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // widget already gone — nothing to clean up
        }
      }
    };
  }, [captchaEnabled, sitekey]);

  // Feature-Flag aus ODER kein Sitekey → Widget komplett unsichtbar.
  // Form bleibt funktional; die Server-Seite respektiert das gleiche Flag.
  if (!captchaEnabled || !sitekey) return null;

  return (
    <div
      ref={mountRef}
      className="cf-turnstile"
      aria-label="Spam-Schutz (Cloudflare Turnstile)"
    />
  );
}
