import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fragment } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import {
  breadcrumbTrailForSlug,
  siblingNav,
  categoryForSlug,
} from "@/lib/portfolio";

/**
 * INTERNAL nav A/B/C comparison page — NOT a product page, NOT in the sitemap.
 *
 * Built so the breadcrumb (top) styles AND the end-of-page portfolio-navigation
 * variants can be compared stacked on ONE page (preview deploy), instead of split
 * across live pages. noindex + nofollow; delete once the design is decided.
 *
 * Sample slug = a Skills item with both a previous and a next sibling, so every
 * variant renders with real prev/next labels.
 */
export const metadata: Metadata = {
  title: "Nav-Vorschau (intern) — neckarshore.ai",
  robots: { index: false, follow: false },
};

const SAMPLE = "ai-phrase-check"; // Skills → has prev (IMAP) + next (Restaurant-Menüpflege)

const accentLink =
  "text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright";

function Frame({
  label,
  caption,
  children,
}: {
  label: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white/40 p-5 dark:border-text-secondary/10 dark:bg-surface/30">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
          {label}
        </span>
        <span className="text-sm text-muted dark:text-text-tertiary">{caption}</span>
      </div>
      <div className="rounded-xl border border-dashed border-primary/10 bg-neutral-light/50 p-4 dark:border-text-secondary/10 dark:bg-deep-space/40">
        {children}
      </div>
    </div>
  );
}

/** Full breadcrumb trail with a configurable separator glyph. */
function Trail({ slug, sep }: { slug: string; sep: string }) {
  const trail = breadcrumbTrailForSlug(slug);
  return (
    <nav className="text-sm text-muted dark:text-text-secondary/60">
      {trail.map((crumb, index) => (
        <Fragment key={`${crumb.name}-${index}`}>
          {index > 0 && (
            <span className="mx-2" aria-hidden="true">
              {sep}
            </span>
          )}
          {crumb.href ? (
            <Link href={crumb.href} className="transition-colors hover:text-accent">
              {crumb.name}
            </Link>
          ) : (
            <span className="text-primary/70 dark:text-text-secondary">{crumb.name}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/** Compact "back to parent" pill — minimal, mobile-friendly, no full trail. */
function CompactBack({ slug }: { slug: string }) {
  const category = categoryForSlug(slug);
  if (!category) return null;
  return (
    <Link
      href={category.href}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 px-3 py-1 text-sm font-medium text-primary/80 transition-colors hover:border-accent/40 hover:text-accent dark:border-text-secondary/15 dark:text-text-secondary"
    >
      <span aria-hidden="true">←</span> {category.title}
    </Link>
  );
}

/** Variante A — "Durchblättern": prev/next tiles + Alle Skills. */
function NavTiles({ slug }: { slug: string }) {
  const category = categoryForSlug(slug);
  const { prev, next } = siblingNav(slug);
  const singular = category ? category.title.replace(/s$/, "") : "Eintrag";
  const tile =
    "group rounded-xl border border-primary/10 p-4 transition-colors hover:border-accent/40 dark:border-text-secondary/10";
  const eyebrow =
    "block text-xs font-medium uppercase tracking-wider text-muted dark:text-text-tertiary";
  const itemName =
    "mt-1 block font-medium text-primary transition-colors group-hover:text-accent dark:text-text-primary";
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {prev && (
          <Link href={prev.href} className={tile}>
            <span className={eyebrow}>← Vorheriger {singular}</span>
            <span className={itemName}>{prev.name}</span>
          </Link>
        )}
        {next && (
          <Link href={next.href} className={`${tile} sm:text-right`}>
            <span className={eyebrow}>Nächster {singular} →</span>
            <span className={itemName}>{next.name}</span>
          </Link>
        )}
      </div>
      <div className="mt-4 text-center">
        {category && (
          <Link href={category.href} className={accentLink}>
            Alle {category.title}
          </Link>
        )}
      </div>
    </div>
  );
}

/** Variante B — "Inline": prev · Alle · next as one quiet row of text links. */
function NavInline({ slug }: { slug: string }) {
  const category = categoryForSlug(slug);
  const { prev, next } = siblingNav(slug);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center">
      {prev && (
        <Link href={prev.href} className={accentLink}>
          ← {prev.name}
        </Link>
      )}
      {category && (
        <Link href={category.href} className="text-sm font-medium text-muted hover:text-accent dark:text-text-tertiary">
          Alle {category.title}
        </Link>
      )}
      {next && (
        <Link href={next.href} className={accentLink}>
          {next.name} →
        </Link>
      )}
    </div>
  );
}

/** Variante C — "Flach": a single back link (≈ the old look). */
function NavFlat() {
  return (
    <Link href="/products" className={accentLink}>
      ← Alle Produkte
    </Link>
  );
}

export default function NavVorschauPage() {
  return (
    <>
      <Nav showOssLaunch={false} />
      <main className="mx-auto max-w-[820px] px-4 pt-40 pb-20 md:px-6">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
          Interne Vorschau · noindex · nicht im Menü
        </div>

        <header className="mb-12">
          <h1 className="font-heading text-4xl font-bold text-primary dark:text-text-primary md:text-5xl">
            Nav-Vorschau
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Alle Varianten gestapelt auf einer Seite — Breadcrumb-Stile oben,
            Portfolio-Navigation am Seitenende. Beispiel: ein Skill mit Vorgänger und
            Nachfolger. Theme-Toggle oben rechts zeigt Light + Dark.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="mb-5 font-heading text-2xl font-bold text-accent">
            1 · Breadcrumb (oben)
          </h2>
          <div className="grid gap-4">
            <Frame label="Stil A · Slash" caption="aktuell live — voller 4-Ebenen-Pfad">
              <Trail slug={SAMPLE} sep="/" />
            </Frame>
            <Frame label="Stil B · Chevron" caption="voller Pfad, › statt / — typischer Breadcrumb-Look">
              <Trail slug={SAMPLE} sep="›" />
            </Frame>
            <Frame
              label="Stil C · Kompakt"
              caption="nur Sprung zur Eltern-Kategorie, kein voller Pfad — minimal, mobil-freundlich"
            >
              <CompactBack slug={SAMPLE} />
            </Frame>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="mb-5 font-heading text-2xl font-bold text-accent">
            2 · Portfolio-Navigation (Seitenende)
          </h2>
          <div className="grid gap-4">
            <Frame
              label="Variante A · Durchblättern"
              caption="prev/next als Kacheln + Alle Skills — lädt zum Weiterstöbern ein"
            >
              <NavTiles slug={SAMPLE} />
            </Frame>
            <Frame
              label="Variante B · Inline"
              caption="prev · Alle · next als eine ruhige Zeile — leichter als Kacheln"
            >
              <NavInline slug={SAMPLE} />
            </Frame>
            <Frame
              label="Variante C · Flach"
              caption="ein einzelner Zurück-Link — entspricht im Wesentlichen dem alten Stand"
            >
              <NavFlat />
            </Frame>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/10 bg-white/40 p-6 dark:border-text-secondary/10 dark:bg-surface/30">
          <h2 className="font-heading text-xl font-bold text-primary dark:text-text-primary">
            Entscheidung
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Sag mir eine Kombination — z.B. Breadcrumb Stil B + Navigation Variante A —
            oder definiere neue Regeln (etwa: Kacheln nur bei Kategorien mit mehreren
            Einträgen, sonst Inline). Den Gewinner rolle ich dann einheitlich auf alle
            Produkt-Detailseiten aus.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
