import Link from "next/link";
import type { PortfolioItem } from "@/lib/portfolio";

/**
 * Shared product card — used by the /products portal (heading level h3, under a
 * section h2) and by the per-category sub-portals (heading level h2, directly under
 * the page h1). The level is a prop so neither surface skips a heading level
 * (TC-CNT-031). Internal items render as a Next <Link>; external sites (Websites tier)
 * render as a real https <a target=_blank> — never a bare `#` (TC-CNT-012).
 */

const cardClass =
  "group block rounded-xl border border-primary/5 bg-white/50 p-6 transition-all hover:border-accent/30 hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface";

function StatusBadge({ item }: { item: PortfolioItem }) {
  if (item.status === "preview") {
    return (
      <span className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
        In Entwicklung
      </span>
    );
  }
  if (item.status === "external") {
    return (
      <span className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
        Extern&nbsp;↗
      </span>
    );
  }
  return null;
}

function CardBody({
  item,
  headingLevel,
  cta,
}: {
  item: PortfolioItem;
  headingLevel: "h2" | "h3";
  cta: string;
}) {
  const Heading = headingLevel;
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <Heading className="font-heading text-lg font-semibold text-primary dark:text-text-primary">
          {item.name}
        </Heading>
        <StatusBadge item={item} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
        {item.tagline}
      </p>
      <span className="mt-4 inline-block text-sm font-medium text-accent group-hover:text-accent-hover dark:text-accent-bright">
        {cta}
      </span>
    </>
  );
}

export function ProductCard({
  item,
  headingLevel = "h3",
}: {
  item: PortfolioItem;
  headingLevel?: "h2" | "h3";
}) {
  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        data-track={`product_card_${item.slug}`}
        className={cardClass}
      >
        <CardBody item={item} headingLevel={headingLevel} cta="Website öffnen ↗" />
      </a>
    );
  }
  return (
    <Link href={item.href} data-track={`product_card_${item.slug}`} className={cardClass}>
      <CardBody item={item} headingLevel={headingLevel} cta="Mehr erfahren →" />
    </Link>
  );
}
