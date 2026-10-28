import { OSS_LAUNCH_SICHTBAR } from "@/lib/kontakt-config";
import { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * THE 404 — "Neckar-Kilometer 404" (Founder, 2026-10-28: the Kaze 404 is the yardstick, this
 * one "fällt ein bisschen ab").
 *
 * THE JOKE RESTS ON ONE NUMBER, so it is sourced: the Neckar is about 362 km long (Land
 * Baden-Württemberg; dewiki "Neckartal" 362.3 km; some sources say 367 km). Either way there is
 * no kilometre 404. The text says "rund 362" and nothing more precise.
 *
 * THE SIGN is drawn after the kilometre boards on German federal waterways: a white board with
 * black figures on two posts. It stays white in dark mode, as a real sign would. The water
 * drifts slowly; under reduced motion the global rule in globals.css stops it.
 */
export const metadata: Metadata = {
  title: "404 — Seite nicht gefunden — neckarshore.ai",
  description: "Diese Seite existiert nicht. Zurück zur Startseite von neckarshore.ai.",
  robots: { index: false, follow: false },
};

const showOssLaunch = OSS_LAUNCH_SICHTBAR;

function KilometerTafel() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="h-auto w-[min(320px,80vw)]"
      aria-hidden="true"
      focusable="false"
      data-neckar-tafel
    >
      {/* posts */}
      <rect x="112" y="78" width="8" height="92" rx="2" className="fill-primary dark:fill-text-tertiary" />
      <rect x="200" y="78" width="8" height="92" rx="2" className="fill-primary dark:fill-text-tertiary" />
      {/* board */}
      <rect x="84" y="14" width="152" height="76" rx="6" fill="#ffffff" stroke="#0A2540" strokeWidth="4" />
      <text
        x="160"
        y="72"
        textAnchor="middle"
        fill="#0A2540"
        style={{ font: "700 52px var(--font-space-grotesk), system-ui, sans-serif", letterSpacing: "0.04em" }}
      >
        404
      </text>
      {/* water: three drifting lines, wider than the box so the drift never shows an end */}
      <g className="neckar-wasser stroke-accent dark:stroke-accent-bright" fill="none" strokeLinecap="round">
        <path className="neckar-welle" d="M-80 160 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" strokeWidth="4" />
        <path className="neckar-welle neckar-welle-2" d="M-80 176 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" strokeWidth="3" opacity="0.7" />
        <path className="neckar-welle neckar-welle-3" d="M-80 191 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" strokeWidth="2" opacity="0.45" />
      </g>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav showOssLaunch={showOssLaunch} />
      <main
        className="mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center justify-center px-4 py-16 text-center"
        data-neckar-404
      >
        <KilometerTafel />
        <h1 className="mt-8 font-heading text-[1.75rem] leading-tight font-bold sm:text-4xl text-primary md:text-5xl dark:text-text-primary">
          <span className="block">Neckar-Kilometer{"\u00a0"}404</span>
          <span className="block">gibt es nicht.</span>
        </h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted dark:text-text-secondary">
          Der Neckar mündet nach rund 362 Kilometern in den Rhein. Bis hierher fließt er nicht.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Zurück zur Startseite
        </Link>
      </main>
      <Footer />
    </div>
  );
}
