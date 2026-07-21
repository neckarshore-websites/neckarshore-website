import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Cpu,
  FileText,
  Globe,
  Info,
  Mail,
  Menu,
  Shield,
  TestTubeDiagonal,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Nav from "@/components/Nav";
import { StatusPill } from "@/components/StatusPill";

/**
 * Internal Style Guide / Design-System reference for neckarshore.ai.
 *
 * Not for customers — a mirror of the live design system so the tokens can be
 * eyeballed in situ. `noindex, nofollow` keeps it out of Google; it is also
 * deliberately absent from the on-site search index and the sitemap. Reachable
 * only via a discreet "Style Guide" link in the landing-page footer meta-strip
 * (2026-07-21 — "es ist für mich, keiner soll suchen").
 *
 * Source of truth for every token: `src/app/globals.css` (Tailwind v4 @theme).
 * Components live in `src/components/`. Changes happen there, never here — this
 * page only reflects what already exists. Flip Light/Dark via the theme toggle
 * in the nav to check both themes.
 */

export const metadata: Metadata = {
  title: "Style Guide — intern",
  description: "Internes Design-System: Farben, Typografie, Komponenten.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/style-guide" },
};

/* ---------------------------------------------------------------------- */
/* Data                                                                    */
/* ---------------------------------------------------------------------- */

type Swatch = {
  name: string;
  /** CSS custom property in globals.css @theme. */
  token: string;
  /** Tailwind utility stem (bg-…, text-…). */
  cls: string;
  hex: string;
  usage: string;
  /** Foreground hex for the label printed on the chip. */
  fg: string;
  /** Optional contrast note. */
  contrast?: string;
};

const BRAND: Swatch[] = [
  {
    name: "Primary — Neckar Blue",
    token: "--color-primary",
    cls: "primary",
    hex: "#0A2540",
    fg: "#F1F5F9",
    usage: "Basis-Text auf Hell, dunkle Brand-Bänder, Secondary-Button-Border.",
    contrast: "AAA auf Weiß (15.9 : 1)",
  },
  {
    name: "Secondary — Cyan",
    token: "--color-secondary",
    cls: "secondary",
    hex: "#00D4FF",
    fg: "#0A2540",
    usage: "Eyebrows & Card-Icons auf dunklem Grund, Hero-Glow. NIE als Text auf Weiß.",
    contrast: "nur auf Dunkel — decorative on light",
  },
  {
    name: "Accent — Teal",
    token: "--color-accent",
    cls: "accent",
    hex: "#0E7490",
    fg: "#FFFFFF",
    usage: "Primary-Button, Links, Focus-Ring — der Arbeits-Akzent auf Hell.",
    contrast: "AA auf Weiß (4.7 : 1)",
  },
  {
    name: "Accent Hover",
    token: "--color-accent-hover",
    cls: "accent-hover",
    hex: "#0C6478",
    fg: "#FFFFFF",
    usage: "Hover-State für Primary-Button und Links.",
  },
  {
    name: "Accent Active",
    token: "--color-accent-active",
    cls: "accent-active",
    hex: "#0A5468",
    fg: "#FFFFFF",
    usage: "Active / Pressed-State.",
  },
  {
    name: "Accent Bright",
    token: "--color-accent-bright",
    cls: "accent-bright",
    hex: "#22D3EE",
    fg: "#0A2540",
    usage: "Dark-Mode-Akzent — Links & Card-Subtitles auf dunkel. AA auf deep-space/surface.",
    contrast: "nur Dark Mode",
  },
];

const NEUTRALS: Swatch[] = [
  {
    name: "Neutral Light",
    token: "--color-neutral-light",
    cls: "neutral-light",
    hex: "#F1F5F9",
    fg: "#0A2540",
    usage: "Heller Seiten-Grund, Card-Fläche (accent-left Cards).",
  },
  {
    name: "Neutral Dark",
    token: "--color-neutral-dark",
    cls: "neutral-dark",
    hex: "#1E2937",
    fg: "#F1F5F9",
    usage: "Body-Text-Ton auf Hell (meist als neutral-dark/80).",
  },
  {
    name: "Muted",
    token: "--color-muted",
    cls: "muted",
    hex: "#64748B",
    fg: "#FFFFFF",
    usage: "Sekundär-Text, Captions, Footer-Meta.",
    contrast: "AA auf Weiß (4.9 : 1)",
  },
];

const STATE: Swatch[] = [
  {
    name: "Success",
    token: "--color-success",
    cls: "success",
    hex: "#10B981",
    fg: "#0A2540",
    usage: "Live-Signal (Footer-Ticker-Dot), Erfolgs-Zustände.",
  },
  {
    name: "Error",
    token: "--color-error",
    cls: "error",
    hex: "#EF4444",
    fg: "#FFFFFF",
    usage: "Formular-Fehler, Validierungs-Hinweise.",
  },
];

const DARK_SURFACES: Swatch[] = [
  {
    name: "Deep Space",
    token: "--color-deep-space",
    cls: "deep-space",
    hex: "#0F172A",
    fg: "#F1F5F9",
    usage: "Dunkler Seiten-Grund (Dark Mode).",
  },
  {
    name: "Surface",
    token: "--color-surface",
    cls: "surface",
    hex: "#1E2937",
    fg: "#F1F5F9",
    usage: "Dunkle Card- / Section-Fläche (Dark Mode).",
  },
  {
    name: "Text Primary",
    token: "--color-text-primary",
    cls: "text-primary",
    hex: "#F1F5F9",
    fg: "#0F172A",
    usage: "Haupt-Text auf dunklem Grund.",
  },
  {
    name: "Text Secondary",
    token: "--color-text-secondary",
    cls: "text-secondary",
    hex: "#CBD5E1",
    fg: "#0F172A",
    usage: "Body-Text auf dunklem Grund.",
  },
  {
    name: "Text Tertiary",
    token: "--color-text-tertiary",
    cls: "text-tertiary",
    hex: "#94A3B8",
    fg: "#0F172A",
    usage: "Captions auf dunkel — ersetzt das /50-Opacity-Anti-Pattern. AA-safe.",
    contrast: "AA auf deep-space (6.4 : 1)",
  },
];

const ICONS: { icon: LucideIcon; name: string; use: string }[] = [
  { icon: Cpu, name: "Cpu", use: "AI-Powered Development" },
  { icon: FileText, name: "FileText", use: "Documentation Automation" },
  { icon: Brain, name: "Brain", use: "AI Consulting & Strategy" },
  { icon: Shield, name: "Shield", use: "DSGVO-by-Design" },
  { icon: TestTubeDiagonal, name: "TestTubeDiagonal", use: "Quality Engineering" },
  { icon: Users, name: "Users", use: "Nearshore Partnership" },
  { icon: Clock, name: "Clock", use: "vs. Offshore" },
  { icon: TrendingUp, name: "TrendingUp", use: "vs. Big-4" },
  { icon: Globe, name: "Globe", use: "Made in Germany" },
  { icon: Mail, name: "Mail", use: "Kontakt" },
  { icon: ArrowRight, name: "ArrowRight", use: "CTA-Suffix, Link" },
  { icon: ChevronDown, name: "ChevronDown", use: "Dropdown, Accordion" },
  { icon: Check, name: "Check", use: "Bestätigung, Consent" },
  { icon: Info, name: "Info", use: "Hinweis-Box" },
  { icon: Menu, name: "Menu", use: "Mobile-Nav öffnen" },
  { icon: X, name: "X", use: "Schließen, Dismiss" },
];

/* ---------------------------------------------------------------------- */
/* Primitives                                                              */
/* ---------------------------------------------------------------------- */

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-primary/5 px-1.5 py-0.5 font-mono text-[0.8em] text-accent dark:bg-text-secondary/10 dark:text-accent-bright">
      {children}
    </code>
  );
}

function SectionHead({
  number,
  title,
  note,
}: {
  number: string;
  title: string;
  note?: string;
}) {
  return (
    <header className="mb-10 border-b border-primary/10 pb-4 dark:border-text-secondary/15">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent dark:text-accent-bright">
        {number}
      </p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
        {title}
      </h2>
      {note && (
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          {note}
        </p>
      )}
    </header>
  );
}

function SwatchCard({ swatch }: { swatch: Swatch }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/10 bg-white p-4 dark:border-text-secondary/15 dark:bg-surface">
      <div
        className="flex h-24 items-end rounded-lg p-3"
        style={{ background: swatch.hex }}
        aria-hidden
      >
        <span className="font-mono text-xs" style={{ color: swatch.fg }}>
          {swatch.hex}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium text-primary dark:text-text-primary">{swatch.name}</p>
        <p className="font-mono text-xs text-muted dark:text-text-tertiary">{swatch.token}</p>
        <p className="font-mono text-xs text-muted dark:text-text-tertiary">bg-{swatch.cls}</p>
        <p className="mt-2 text-xs leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
          {swatch.usage}
        </p>
        {swatch.contrast && (
          <p className="mt-1 text-xs text-accent dark:text-accent-bright">{swatch.contrast}</p>
        )}
      </div>
    </div>
  );
}

function SwatchGroup({ label, swatches }: { label: string; swatches: Swatch[] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:text-text-tertiary">
        {label}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {swatches.map((s) => (
          <SwatchCard key={s.token} swatch={s} />
        ))}
      </div>
    </div>
  );
}

/* Reproduces the real form primitives from ContactForm.tsx — static, for display. */
const labelClass = "mb-1.5 block text-sm font-medium text-primary dark:text-text-primary";
const fieldClass =
  "w-full rounded-lg border border-primary/15 bg-white px-4 py-3 text-base text-primary placeholder:text-muted focus:border-accent focus:outline-none dark:border-text-secondary/20 dark:bg-deep-space dark:text-text-primary";

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */

export default function StyleGuidePage() {
  return (
    <>
      <Nav showOssLaunch={false} />
      <main className="bg-neutral-light dark:bg-deep-space">
        <article className="mx-auto max-w-[1200px] px-4 pt-32 pb-24 md:px-6 md:pt-40">
          {/* Header */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent dark:text-accent-bright">
            Intern
          </p>
          <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-primary md:text-[56px] dark:text-text-primary">
            Style Guide
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Design-System-Referenz für neckarshore.ai — jede Farbe, jede Schrift, jede
            Komponente in situ. Kein Kunden-Content: eine Referenz, keine Seite. Erreichbar
            nur über den dezenten Footer-Link, <Code>noindex</Code>, nicht in der Suche,
            nicht in der Sitemap.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted dark:text-text-tertiary">
            Quelle aller Tokens: <Code>src/app/globals.css</Code> (Tailwind v4{" "}
            <Code>@theme</Code>). Komponenten leben in <Code>src/components/</Code>.
            Änderungen passieren dort, nicht hier. Light/Dark per Theme-Toggle in der Nav
            umschalten — die ganze Seite ist dark-aware.
          </p>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 01 · Farben */}
          <section>
            <SectionHead
              number="01 · Farben"
              title="Palette"
              note="Neckar-Blau als Basis, Teal als Arbeits-Akzent, Cyan als sparsames Highlight auf Dunkel. Kontrast-Werte gegen Weiß, sofern nicht anders vermerkt. Dark-Mode-Töne haben eigene AA-geprüfte Werte statt Opacity-Tricks."
            />
            <div className="flex flex-col gap-12">
              <SwatchGroup label="Brand" swatches={BRAND} />
              <SwatchGroup label="Neutrals" swatches={NEUTRALS} />
              <SwatchGroup label="State" swatches={STATE} />
              <SwatchGroup label="Dark-Mode-Flächen & -Text" swatches={DARK_SURFACES} />
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 02 · Typografie */}
          <section>
            <SectionHead
              number="02 · Typografie"
              title="Schrift-System"
              note="Zwei self-hosted Variable Fonts (DSGVO, kein CDN): Space Grotesk für Headings, Inter für Body. Headings tight gekernt (tracking-tight), Body luftig (leading-relaxed)."
            />
            <div className="space-y-10">
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  h1 · font-heading · text-4xl→56px · font-bold · leading-[1.1] · tracking-tight
                </p>
                <p className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-primary md:text-[56px] dark:text-text-primary">
                  Software Development. Closer to Home.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  h2 · font-heading · text-3xl→4xl · font-semibold · tracking-tight
                </p>
                <p className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl dark:text-text-primary">
                  Warum Nearshore?
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  h3 · font-heading · text-xl→2xl · font-semibold
                </p>
                <p className="font-heading text-xl font-semibold text-primary md:text-2xl dark:text-text-primary">
                  AI-Powered Development
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  Eyebrow · text-sm · uppercase · tracking-widest · text-accent (Hell) / text-secondary (Dunkel)
                </p>
                <p className="text-sm font-semibold uppercase tracking-widest text-accent dark:text-secondary">
                  Unser Portfolio
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  Body-Lg · font-body (Inter) · text-lg · leading-relaxed · neutral-dark/80
                </p>
                <p className="max-w-2xl text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  neckarshore.ai bringt KI-beschleunigte Softwareentwicklung zurück nach
                  Stuttgart. Gleiche Zeitzone, gleiche Sprache, gleiche Datenschutzstandards.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  Subtitle · text-sm · font-medium · text-accent / dark:text-accent-bright
                </p>
                <p className="text-sm font-medium text-accent dark:text-accent-bright">
                  All the speed, none of the risk.
                </p>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs text-muted dark:text-text-tertiary">
                  Small / Meta · text-sm · text-muted
                </p>
                <p className="text-sm text-muted dark:text-text-tertiary">
                  Stuttgart, Deutschland — wir antworten zeitnah.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 03 · Buttons */}
          <section>
            <SectionHead
              number="03 · Buttons & CTAs"
              title="Button-System"
              note="Primary (solid teal, micro-scale on hover), Secondary (outline Neckar-Blau, fill on hover), Ghost (Text-Link). Alle rounded-lg, px-8 py-3.5. Disabled via opacity-60 + cursor-wait."
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
              >
                Primary — Kennenlerntermin buchen
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-8 py-3.5 text-base font-medium text-primary transition-all duration-150 hover:bg-primary hover:text-white dark:border-text-primary dark:text-text-primary dark:hover:bg-text-primary dark:hover:text-deep-space"
              >
                Secondary — Unsere Services
              </button>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
              >
                Ghost — Alle Produkte ansehen <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-white transition-all duration-150 disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
              >
                Disabled · Wird gesendet …
              </button>
            </div>

            <div className="mt-8 rounded-xl bg-primary p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-secondary">
                Auf dunklem Brand-Grund (bg-primary)
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-base font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
                >
                  Primary bleibt Teal
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-text-primary"
                >
                  Ghost auf Dunkel — Cyan <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 04 · Formulare */}
          <section>
            <SectionHead
              number="04 · Formulare"
              title="Formular-Primitive"
              note="Aus components/ContactForm.tsx. Label + Field mit border-primary/15, Focus wechselt die Border auf accent. Fehler in text-error, Erfolg als accent-Banner."
            />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="sg-name" className={labelClass}>
                    Name
                  </label>
                  <input id="sg-name" type="text" placeholder="Vorname Nachname" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="sg-email" className={labelClass}>
                    E-Mail · mit Fehler
                  </label>
                  <input
                    id="sg-email"
                    type="email"
                    defaultValue="keine-mail"
                    aria-invalid
                    className={fieldClass}
                  />
                  <p className="mt-1.5 text-sm text-error">Bitte eine gültige E-Mail eingeben.</p>
                </div>
                <div>
                  <label htmlFor="sg-msg" className={labelClass}>
                    Nachricht
                  </label>
                  <textarea
                    id="sg-msg"
                    rows={4}
                    placeholder="Was sollten wir wissen?"
                    className={`${fieldClass} resize-y`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-lg border border-accent/30 bg-white p-6 dark:bg-surface">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent dark:text-accent-bright">
                    Success-Banner
                  </p>
                  <p className="mt-3 text-base text-primary dark:text-text-primary">
                    Danke für Ihre Nachricht — wir melden uns zeitnah zurück.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-primary/10 bg-white p-4 dark:border-text-secondary/15 dark:bg-surface">
                  <Info size={20} className="mt-0.5 shrink-0 text-accent dark:text-accent-bright" />
                  <p className="text-sm leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    Spam-Schutz: verstecktes Honeypot-Feld + Cloudflare Turnstile. Keine
                    Tracking-Cookies, keine externen Ressourcen — DSGVO-by-Design.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 05 · Cards & Surfaces */}
          <section>
            <SectionHead
              number="05 · Cards & Flächen"
              title="Cards & Surfaces"
              note="rounded-xl durchgängig. Zwei Card-Typen: accent-left (border-l-4) auf neutral-light, und soft-shadow auf Weiß. Beide heben on-hover leicht an. StatusPill sitzt bottom-left auf jeder Produkt-Card."
            />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="group rounded-xl border-l-4 border-accent bg-neutral-light p-8 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md dark:bg-deep-space">
                <Clock size={32} className="text-secondary" />
                <h3 className="mt-4 font-heading text-xl font-semibold text-primary md:text-2xl dark:text-text-primary">
                  Accent-Left Card
                </h3>
                <p className="mt-1 text-sm font-medium text-accent dark:text-accent-bright">
                  border-l-4 border-accent · bg-neutral-light
                </p>
                <p className="mt-3 leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  Für die „vs.“-Vergleichs-Cards. Icon in Cyan (text-secondary), Subtitle in Teal.
                </p>
                <div className="mt-4">
                  <StatusPill label="Live" />
                </div>
              </div>

              <div className="group rounded-xl bg-white p-8 shadow-[0_10px_30px_rgba(10,37,64,0.08)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(10,37,64,0.14)] dark:bg-surface dark:shadow-none dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <Cpu size={32} className="text-secondary" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-primary md:text-xl dark:text-text-primary">
                  Soft-Shadow Card
                </h3>
                <p className="mt-1 text-sm font-medium text-accent dark:text-accent-bright">
                  bg-white · navy-getönter Schatten
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  Für die Service-Cards. Im Dark Mode Schatten aus, bg-surface statt Weiß.
                </p>
                <div className="mt-4">
                  <StatusPill label="In Entwicklung" />
                </div>
              </div>
            </div>

            <p className="mb-4 mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:text-text-tertiary">
              Section-Grundflächen
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "neutral-light", hex: "#F1F5F9", fg: "#0A2540", note: "Heller Grund" },
                { name: "white", hex: "#FFFFFF", fg: "#0A2540", note: "Card / Section" },
                { name: "primary", hex: "#0A2540", fg: "#F1F5F9", note: "Dunkles Brand-Band" },
                { name: "accent", hex: "#0E7490", fg: "#FFFFFF", note: "Teal-Band (CTA)" },
                { name: "deep-space", hex: "#0F172A", fg: "#F1F5F9", note: "Dark-Grund" },
                { name: "surface", hex: "#1E2937", fg: "#F1F5F9", note: "Dark-Card" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex h-24 flex-col justify-between rounded-xl p-4"
                  style={{ background: s.hex, color: s.fg }}
                >
                  <span className="font-mono text-xs">{s.hex}</span>
                  <span>
                    <span className="block font-mono text-sm">{s.name}</span>
                    <span className="text-xs opacity-80">{s.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 06 · Spacing & Layout */}
          <section>
            <SectionHead
              number="06 · Spacing & Layout"
              title="Container & Rhythmus"
              note="Ein Container: max-w-[1200px], mittig, responsive Padding. Vertikaler Rhythmus über py-20 md:py-24 pro Section. 8px-Grid-Spacing-Tokens."
            />
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { t: "Container", d: "mx-auto max-w-[1200px] · px-4 md:px-6" },
                { t: "Section-Padding", d: "py-20 md:py-24 — 80px mobil, 96px Desktop" },
                { t: "Card-Padding", d: "p-8 (Standard-Card), p-6 (Banner), p-4 (Swatch)" },
                { t: "Border-Radius", d: "rounded-lg (Buttons/Fields), rounded-xl (Cards), rounded-full (Pills)" },
                { t: "Spacing-Grid", d: "8px-Basis: 4·8·12·16·24·32·48·64·80·96·128px" },
                { t: "Focus-Ring", d: "outline 2px accent · offset 2px · + 4px accent/25 glow" },
              ].map((row) => (
                <div
                  key={row.t}
                  className="rounded-xl border border-primary/10 bg-white p-5 dark:border-text-secondary/15 dark:bg-surface"
                >
                  <dt className="font-mono text-xs text-muted dark:text-text-tertiary">{row.t}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    {row.d}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:text-text-tertiary">
                Spacing-Skala (8px-Grid)
              </p>
              <div className="flex flex-wrap items-end gap-4">
                {[
                  { n: "2", px: 8 },
                  { n: "4", px: 16 },
                  { n: "6", px: 24 },
                  { n: "8", px: 32 },
                  { n: "12", px: 48 },
                  { n: "16", px: 64 },
                ].map((s) => (
                  <div key={s.n} className="flex flex-col items-center gap-2">
                    <div className="rounded bg-accent" style={{ width: s.px, height: s.px }} aria-hidden />
                    <span className="font-mono text-[11px] text-muted dark:text-text-tertiary">
                      {s.n} · {s.px}px
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 07 · Icons */}
          <section>
            <SectionHead
              number="07 · Icons"
              title="Icon-System"
              note="lucide-react durchgängig — stroke-basiert, tree-shakeable. Auf Cards size 32 in Cyan (text-secondary), inline size 16 in Teal (text-accent). Keine zweite Icon-Library."
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ICONS.map(({ icon: Icon, name, use }) => (
                <div
                  key={name}
                  className="flex flex-col gap-2 rounded-xl border border-primary/10 bg-white p-4 dark:border-text-secondary/15 dark:bg-surface"
                >
                  <div className="flex h-12 items-center justify-center rounded-lg bg-neutral-light dark:bg-deep-space">
                    <Icon size={22} className="text-primary dark:text-text-primary" />
                  </div>
                  <p className="font-mono text-[11px] text-muted dark:text-text-tertiary">{name}</p>
                  <p className="text-[11px] leading-snug text-neutral-dark/70 dark:text-text-secondary">
                    {use}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-primary/10 bg-white p-6 dark:border-text-secondary/15 dark:bg-surface">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:text-text-tertiary">
                In Context
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] hover:bg-accent-hover"
                >
                  Kennenlerntermin buchen
                  <ArrowRight size={16} />
                </button>
                <ul className="space-y-2 text-sm text-neutral-dark/85 dark:text-text-secondary">
                  <li className="flex items-center gap-2">
                    <Shield size={16} className="text-accent dark:text-accent-bright" />
                    DSGVO-by-Design
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe size={16} className="text-accent dark:text-accent-bright" />
                    Made in Germany
                  </li>
                  <li className="flex items-center gap-2">
                    <Cpu size={16} className="text-accent dark:text-accent-bright" />
                    AI-Powered
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* 08 · Dark Mode */}
          <section>
            <SectionHead
              number="08 · Dark Mode"
              title="Light & Dark"
              note="Class-based (.dark auf <html>), umgeschaltet über den Theme-Toggle in der Nav (System / Hell / Dunkel, in localStorage gemerkt). Diese ganze Seite ist dark-aware — flip den Toggle oben, um jedes Token in beiden Themes zu sehen."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/10 bg-white p-6 dark:border-text-secondary/15 dark:bg-surface">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent dark:text-accent-bright">
                  Regel
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  Auf Dunkel eigene AA-geprüfte Töne statt Opacity: <Code>accent-bright</Code>{" "}
                  für Links, <Code>text-tertiary</Code> für Captions. Nie{" "}
                  <Code>text-secondary/50</Code>.
                </p>
              </div>
              <div className="rounded-xl border border-primary/10 bg-white p-6 dark:border-text-secondary/15 dark:bg-surface">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent dark:text-accent-bright">
                  Flächen-Mapping
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                  <Code>neutral-light</Code> → <Code>deep-space</Code>, <Code>white</Code> →{" "}
                  <Code>surface</Code>. Text <Code>primary</Code> → <Code>text-primary</Code>.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-16 border-primary/10 dark:border-text-secondary/15" />

          {/* Back link */}
          <p className="text-sm text-muted dark:text-text-tertiary">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
            >
              ← Zurück zur Startseite
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
