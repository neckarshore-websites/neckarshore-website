/**
 * Portfolio — single source of truth for the neckarshore.ai product tree.
 *
 * PURE DATA. No `node:fs`, no markdown imports, no server-only code: this module is
 * imported by the client component `Nav.tsx` AS WELL AS server components (the /products
 * portal, the sub-portals, the [slug] detail route, the sitemap). Anything fs-touching
 * here would break the client build. The markdown content-collection (lib/content/*) is a
 * separate, server-only system — a skeleton item graduates to a content-collection page
 * when real copy lands (Schritt 2).
 *
 * The tree mirrors the real GitHub org split (verified live 2026-06-17):
 *   flagships → omnopsis-ai · mmps → neckarshore-mmps · skills → neckarshore-skills
 *   websites  → neckarshore-websites (Beifang)
 *
 * Adding a product = ONE entry here (AP-1, "add a product = 1 edit"). Nav, portal,
 * sub-portals, the dynamic detail route, and the sitemap all derive from PORTFOLIO.
 */

export type ProductStatus = "live" | "preview" | "external";
export type ProductSchemaType = "SoftwareApplication" | "none";
export type CategoryId = "flagships" | "mmps" | "skills" | "websites";

export interface PortfolioItem {
  /** Human-facing name (card heading + detail H1). */
  name: string;
  /** URL slug under /products/<slug>. Ignored for external items. */
  slug: string;
  /** Placeholder one-liner — refined in the content pass (Schritt 2). */
  tagline: string;
  status: ProductStatus;
  /** Link target: internal "/products/<slug>" OR an external "https://…". */
  href: string;
  /** external → renders target=_blank, no detail page, excluded from sitemap + generateStaticParams. */
  isExternal: boolean;
  /** "SoftwareApplication" emits a preview JSON-LD entity on the detail page; "none" = no schema. */
  schemaType: ProductSchemaType;
  /** schema.org applicationCategory for the SoftwareApplication node. */
  applicationCategory?: string;
  /** preview skeletons → robots noindex + held out of the sitemap until content lands. */
  noindex?: boolean;
  /** true for omnopsis/clearpath: they own bespoke static pages → excluded from [slug] generateStaticParams. */
  hasOwnPage?: boolean;
}

export interface PortfolioCategory {
  id: CategoryId;
  /** Section heading + sub-portal H1. */
  title: string;
  /** Dropdown sub-label / portal section subtitle. */
  subtitle: string;
  /** Nav dropdown label. */
  navLabel: string;
  /** Sub-portal route, "/products/<id>". */
  href: string;
  /** Analytics key prefix. */
  track: string;
  items: PortfolioItem[];
}

export const PORTFOLIO: PortfolioCategory[] = [
  {
    id: "flagships",
    title: "Flagships",
    subtitle: "Unser Flaggschiff",
    navLabel: "Flagships",
    href: "/products/flagships",
    track: "nav_products_flagships",
    items: [
      {
        name: "Omnopsis Documentor+X",
        slug: "omnopsis",
        tagline: "KI-first Documentation Engine für Engineering-Teams — fail-closed, BYOLLM, DSGVO-by-Design.",
        status: "live",
        href: "/products/omnopsis",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "BusinessApplication",
        hasOwnPage: true,
      },
    ],
  },
  {
    id: "mmps",
    title: "MMPs",
    subtitle: "Minimum Marketable Products",
    navLabel: "MMPs",
    href: "/products/mmps",
    track: "nav_products_mmps",
    items: [
      {
        name: "ClearPath",
        slug: "clearpath",
        tagline: "Eine mentale Firewall gegen kognitive Verzerrungen.",
        status: "live",
        href: "/products/clearpath",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "BusinessApplication",
        hasOwnPage: true,
      },
      {
        name: "Snakeoil-Check",
        slug: "snakeoil-check",
        tagline: "Neutraler KI-Reality-Check für Online-Coachings und High-Ticket-Angebote.",
        status: "preview",
        href: "/products/snakeoil-check",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "BusinessApplication",
        noindex: true,
      },
      {
        name: "Local-SEO-Hub",
        slug: "local-seo-hub",
        tagline: "AI-first Sichtbarkeits-Plattform für lokale Unternehmen — Rankings, Reviews, Citations in einem Score.",
        status: "preview",
        href: "/products/local-seo-hub",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "BusinessApplication",
        noindex: true,
      },
      {
        name: "Phonesis Voicebank",
        slug: "phonesis",
        tagline: "Ein Archiv echter menschlicher Stimmen für den deutschen Markt.",
        status: "preview",
        href: "/products/phonesis",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "MultimediaApplication",
        noindex: true,
      },
      {
        name: "Prod-or-Pretend",
        slug: "prod-or-pretend",
        tagline: "Ein Qualitäts-Spiegel für Tech-Hype — prüft „an-einem-Wochenende-gebaut\"-Claims gegen echte Produktionsstandards.",
        status: "preview",
        href: "/products/prod-or-pretend",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "DeveloperApplication",
        noindex: true,
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    subtitle: "Fokussierte Open-Source-Werkzeuge",
    navLabel: "Skills",
    href: "/products/skills",
    track: "nav_products_skills",
    items: [
      {
        name: "Obsidian Vault Autopilot",
        slug: "obsidian-vault-autopilot",
        tagline: "Open-Source-Automatisierung für Wissens-Vaults in Obsidian — sortiert, benennt, taggt und reichert Notizen an.",
        status: "preview",
        href: "/products/obsidian-vault-autopilot",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "DeveloperApplication",
        noindex: true,
      },
      {
        name: "Social Scrapers",
        slug: "social-scrapers",
        tagline: "Obsidian-Skills für Instagram-, LinkedIn- und X-Profile — neutrale Markdown-Briefings statt Engagement-Bait.",
        status: "preview",
        href: "/products/social-scrapers",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "UtilitiesApplication",
        noindex: true,
      },
      {
        name: "IMAP Mailbox Cleanup",
        slug: "imap-mailbox-cleanup",
        tagline: "Hybrid CLI + Claude-Skill für IONOS-IMAP-Postfach-Triage — dry-run by default, audit-logged.",
        status: "preview",
        href: "/products/imap-mailbox-cleanup",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "UtilitiesApplication",
        noindex: true,
      },
      {
        name: "AI Phrase Check",
        slug: "ai-phrase-check",
        tagline: "Erkennt KI-typische Floskeln in deutschem und englischem Text.",
        status: "preview",
        href: "/products/ai-phrase-check",
        isExternal: false,
        schemaType: "SoftwareApplication",
        applicationCategory: "UtilitiesApplication",
        noindex: true,
      },
    ],
  },
  {
    id: "websites",
    title: "Websites",
    subtitle: "Web-Präsenz — Beifang",
    navLabel: "Websites",
    href: "/products/websites",
    track: "nav_products_websites",
    items: [
      {
        name: "Ristorante Goldoni",
        slug: "ristorante-goldoni",
        tagline: "Web-Präsenz für ein italienisches Restaurant.",
        status: "external",
        href: "https://ristorante-goldoni.de",
        isExternal: true,
        schemaType: "none",
      },
      {
        name: "neckarshore.ai",
        slug: "neckarshore",
        tagline: "Diese Seite — KI-beschleunigt gebaut, DSGVO-by-Design.",
        status: "external",
        href: "https://neckarshore.ai",
        isExternal: true,
        schemaType: "none",
      },
      {
        name: "Oakwood Golf Club",
        slug: "oakwood-golf-club",
        tagline: "Web-Präsenz für einen Golfclub — Mitglieder-Portal in Arbeit.",
        status: "external",
        href: "https://oakwoodgolfclub.de",
        isExternal: true,
        schemaType: "none",
      },
      {
        name: "Rauhut",
        slug: "rauhut",
        tagline: "Persönliche Web-Präsenz.",
        status: "external",
        href: "https://rauhut.com",
        isExternal: true,
        schemaType: "none",
      },
    ],
  },
];

/** All categories, in nav/portal order. */
export function allCategories(): PortfolioCategory[] {
  return PORTFOLIO;
}

/** Flat list of all items across every category. */
export function allItems(): PortfolioItem[] {
  return PORTFOLIO.flatMap((c) => c.items);
}

/** Slugs that the dynamic [slug] route owns: internal, non-bespoke skeletons. */
export function allInternalDetailSlugs(): string[] {
  return allItems()
    .filter((i) => !i.isExternal && !i.hasOwnPage)
    .map((i) => i.slug);
}

/** Look up an item by its slug (across all categories). */
export function getItemBySlug(slug: string): PortfolioItem | undefined {
  return allItems().find((i) => i.slug === slug);
}

/**
 * Indexable product routes for the sitemap: /products, the 4 sub-portals, and the
 * bespoke own-page details (omnopsis, clearpath). Excludes external sites and
 * noindex preview skeletons (held out until content lands).
 */
export function allProductRoutes(): string[] {
  const subPortals = PORTFOLIO.map((c) => c.href);
  const indexableDetails = allItems()
    .filter((i) => !i.isExternal && !i.noindex)
    .map((i) => i.href);
  return ["/products", ...subPortals, ...indexableDetails];
}
