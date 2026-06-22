import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductDetailNav } from "@/components/ProductDetailNav";
import { ProductFaq, type FaqItem } from "@/components/ProductFaq";
import { SkillCard } from "@/components/SkillCard";
import { breadcrumbTrailForSlug } from "@/lib/portfolio";
import { SKILL_CARDS } from "@/lib/skill-cards";

/**
 * Shared skill detail-page shell — extracted at the rule-of-three (social-scrapers +
 * imap-mailbox-cleanup + restaurant-menu-update, 2026-06-21). Renders the consistent
 * chrome every skill detail page carries:
 *
 *   Nav · (SoftwareApplication + FAQPage JSON-LD) · 760px main · Breadcrumbs ·
 *   SkillCard hero (H1) · <article> = bespoke sections (children) + the FAQ section ·
 *   "Wie dieser Text entstand" honesty note · ProductDetailNav (sibling browse + CTA) · Footer
 *
 * The bespoke per-skill sections are passed as `children`; everything repeated lives here.
 * Optional props degrade cleanly: a private skill with no public repo omits `repoUrl`
 * (no GitHub CTA), a thin page omits `faqItems` (no FAQ section + no FAQPage schema).
 *
 * NOTE (deliberate): the two already-accepted bespoke pages (obsidian-vault-autopilot,
 * ai-phrase-check) are NOT migrated onto this template — they were Founder-accepted as-is,
 * and a refactor of signed-off pages carries needless regression risk. This shell serves
 * the NEW pages; the existing two can adopt it later if ever touched.
 */

/** Re-exported for back-compat; the FAQ shape lives in ProductFaq now. */
export type SkillFaqItem = FaqItem;

export function SkillDetailPage({
  slug,
  softwareSchema,
  faqItems,
  repoUrl,
  textOrigin = "KI-beschleunigt aus der README und Repo-Dokumentation des Projekts zusammengestellt, vom Gründer redigiert.",
  children,
}: {
  /** Portfolio slug — drives the breadcrumb trail, the SkillCard lookup, and the sibling nav. */
  slug: string;
  /** SoftwareApplication JSON-LD object (real for OSS, preview/no-url for private). Omit for none. */
  softwareSchema?: object;
  /** Mini-FAQ — rendered as a visible section AND emitted as FAQPage JSON-LD. Omit to skip both. */
  faqItems?: SkillFaqItem[];
  /** Public repo URL → a GitHub CTA under the sibling nav. Omit for private skills. */
  repoUrl?: string;
  /** The "Wie dieser Text entstand" sentence (a sensible default is provided). */
  textOrigin?: string;
  /** The bespoke article sections for this skill (before the FAQ). */
  children: ReactNode;
}) {
  const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";
  const card = SKILL_CARDS[slug];

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      {softwareSchema && (
        <JsonLd data={softwareSchema} id={`schema-softwareapplication-${slug}`} />
      )}
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug(slug)} />

        {/* Hero = the reusable SkillCard, here as the page H1 + at-a-glance summary. */}
        <SkillCard card={card} headingLevel="h1" />

        <article className="mt-14">
          {children}

          <ProductFaq slug={slug} items={faqItems} />
        </article>

        <p className="mt-10 text-sm italic text-muted dark:text-text-tertiary">
          <span className="font-medium not-italic">Wie dieser Text entstand:</span> {textOrigin}
        </p>

        <ProductDetailNav
          slug={slug}
          cta={
            repoUrl ? (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track={`${slug}_detail_github`}
                className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
              >
                Auf GitHub ansehen →
              </a>
            ) : undefined
          }
        />
      </main>
      <Footer />
    </>
  );
}

/**
 * Shared section primitive for skill-detail bespoke content: an h2 + intro paragraph,
 * then arbitrary children. Keeps the heading/leading rhythm identical across pages.
 */
export function SkillSection({
  heading,
  children,
  className = "mt-10",
}: {
  heading: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
        {heading}
      </h2>
      {children}
    </section>
  );
}

/**
 * Chip-row primitive (monospace label + description), reused by the skill detail pages
 * for capability / safety / step lists — the same shape the SkillCard capability rows use.
 */
export function SkillChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-primary/10 bg-white/50 p-4 sm:flex-row sm:items-start sm:gap-4 dark:border-text-secondary/10 dark:bg-surface/40">
      <code className="inline-block shrink-0 rounded bg-primary/5 px-2 py-0.5 text-center text-xs font-semibold text-accent-hover sm:w-[150px] dark:bg-text-secondary/10 dark:text-accent-bright">
        {label}
      </code>
      <span className="text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
        {children}
      </span>
    </div>
  );
}
