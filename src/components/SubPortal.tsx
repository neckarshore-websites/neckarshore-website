import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { collectionPageSchema } from "@/lib/schema/product";
import type { PortfolioCategory } from "@/lib/portfolio";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

/**
 * Shared per-category sub-portal (Server Component). Lists one PORTFOLIO category's
 * items via the shared ProductCard at heading level h2 (page H1 → card h2, no skip —
 * TC-CNT-031). Emits a CollectionPage JSON-LD entity for the listing.
 */
export default function SubPortal({
  category,
  description,
}: {
  category: PortfolioCategory;
  description: string;
}) {
  const schema = collectionPageSchema({
    name: `${category.title} — neckarshore.ai`,
    description,
    url: `https://neckarshore.ai${category.href}`,
  });

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd data={schema} id={`schema-collectionpage-${category.id}`} />
      <main className="mx-auto max-w-[960px] px-4 pt-40 pb-20 md:px-6">
        <nav
          aria-label="Brotkrumen"
          className="mb-8 text-sm text-muted dark:text-text-secondary/60"
        >
          <Link href="/" className="transition-colors hover:text-accent">
            Start
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href="/products" className="transition-colors hover:text-accent">
            Produkte
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-primary/70 dark:text-text-secondary">{category.title}</span>
        </nav>

        <header className="max-w-[640px]">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent">
            {category.subtitle}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary dark:text-text-primary md:text-5xl">
            {category.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            {description}
          </p>
        </header>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {category.items.map((item) => (
            <ProductCard key={item.slug} item={item} headingLevel="h2" />
          ))}
        </div>

        <div className="mt-12 border-t border-primary/5 pt-8 dark:border-text-secondary/10">
          <Link
            href="/products"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
          >
            ← Alle Produkte
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
