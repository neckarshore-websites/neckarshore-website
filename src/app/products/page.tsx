import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

export const metadata: Metadata = pageMetadata({
  title: "Produkte — neckarshore.ai",
  description:
    "Das Produkt-Portfolio von neckarshore.ai — vom Flagship Omnopsis über Minimum Marketable Products wie ClearPath bis zu fokussierten Open-Source-Skills. Made in Germany, DSGVO-by-Design.",
  path: "/products",
});

interface ProductCard {
  name: string;
  tagline: string;
  /** Internal link target. When omitted, the card renders as a non-link stub. */
  href?: string;
  /** Status label for stub cards (no live page yet). */
  status?: string;
}

interface Tier {
  id: string;
  title: string;
  subtitle: string;
  items: ProductCard[];
}

const TIERS: Tier[] = [
  {
    id: "omnopsis",
    title: "Omnopsis",
    subtitle: "Flagship",
    items: [
      {
        name: "Omnopsis Documentor",
        tagline: "KI-gestützte Dokumentations-Automatisierung für Engineering-Teams.",
        href: "/#omnopsis",
      },
    ],
  },
  {
    id: "mmps",
    title: "MMPs",
    subtitle: "Minimum Marketable Products",
    items: [
      {
        name: "ClearPath",
        tagline: "Eine mentale Firewall gegen kognitive Verzerrungen.",
        href: "/products/clearpath",
      },
      {
        name: "Obsidian Vault Autopilot",
        tagline: "Open-Source-Automatisierung für Wissens-Vaults in Obsidian.",
        href: "/#open-source",
      },
      {
        name: "Snakeoil-Check",
        tagline: "Prüft KI-Marketing-Versprechen auf Substanz.",
        status: "In Entwicklung",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    subtitle: "Fokussierte Werkzeuge",
    items: [
      {
        name: "AI Phrase Check",
        tagline: "Erkennt KI-typische Floskeln in deutschem und englischem Text.",
        status: "Open Source",
      },
    ],
  },
];

function CardInner({ item }: { item: ProductCard }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold text-primary dark:text-text-primary">
          {item.name}
        </h3>
        {item.status && (
          <span className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
            {item.status}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
        {item.tagline}
      </p>
    </>
  );
}

export default function ProductsIndex() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <main className="mx-auto max-w-[960px] px-4 pt-40 pb-20 md:px-6">
        <header className="max-w-[640px]">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent">
            Produkte
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary dark:text-text-primary md:text-5xl">
            Was wir bauen
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Ein Flagship-Produkt, eine Handvoll Minimum Marketable Products und fokussierte
            Open-Source-Skills — alle nach derselben Arbeitsweise gebaut: KI-beschleunigt,
            DSGVO-by-Design, Made in Germany.
          </p>
        </header>

        <div className="mt-16 space-y-16">
          {TIERS.map((tier) => (
            <section key={tier.id} aria-labelledby={`tier-${tier.id}`}>
              <div className="flex items-baseline gap-3 border-b border-primary/5 pb-3 dark:border-text-secondary/10">
                <h2
                  id={`tier-${tier.id}`}
                  className="font-heading text-2xl font-bold text-primary dark:text-text-primary"
                >
                  {tier.title}
                </h2>
                <span className="text-sm font-medium text-muted dark:text-text-tertiary">
                  {tier.subtitle}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {tier.items.map((item) =>
                  item.href ? (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group block rounded-xl border border-primary/5 bg-white/50 p-6 transition-all hover:border-accent/30 hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface"
                    >
                      <CardInner item={item} />
                      <span className="mt-4 inline-block text-sm font-medium text-accent group-hover:text-accent-hover dark:text-accent-bright">
                        Mehr erfahren →
                      </span>
                    </Link>
                  ) : (
                    <div
                      key={item.name}
                      className="rounded-xl border border-dashed border-primary/10 bg-transparent p-6 dark:border-text-secondary/15"
                    >
                      <CardInner item={item} />
                    </div>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
