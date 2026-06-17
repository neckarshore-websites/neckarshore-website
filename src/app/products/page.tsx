import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";
import { collectionPageSchema } from "@/lib/schema/product";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

const PORTAL_DESCRIPTION =
  "Das Produkt-Portfolio von neckarshore.ai — vom Flagship Omnopsis über Minimum Marketable Products und fokussierte Open-Source-Skills bis zu Web-Präsenzen. Made in Germany, DSGVO-by-Design.";

export const metadata: Metadata = pageMetadata({
  title: "Produkte — neckarshore.ai",
  description: PORTAL_DESCRIPTION,
  path: "/products",
});

const portalSchema = collectionPageSchema({
  name: "Produkte — neckarshore.ai",
  description: PORTAL_DESCRIPTION,
  url: "https://neckarshore.ai/products",
});

export default function ProductsIndex() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd data={portalSchema} id="schema-collectionpage-products" />
      <main className="mx-auto max-w-[960px] px-4 pt-40 pb-20 md:px-6">
        <header className="max-w-[640px]">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent">
            Produkte
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary dark:text-text-primary md:text-5xl">
            Was wir bauen
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Ein Flagship-Produkt, eine Handvoll Minimum Marketable Products, fokussierte
            Open-Source-Skills — und ein paar Web-Präsenzen nebenbei. Alle nach derselben
            Arbeitsweise gebaut: KI-beschleunigt, DSGVO-by-Design, Made in Germany.
          </p>
        </header>

        <div className="mt-16 space-y-16">
          {PORTFOLIO.map((category) => (
            <section key={category.id} aria-labelledby={`tier-${category.id}`}>
              <div className="flex items-baseline gap-3 border-b border-primary/5 pb-3 dark:border-text-secondary/10">
                <h2
                  id={`tier-${category.id}`}
                  className="scroll-mt-28 font-heading text-2xl font-bold text-primary dark:text-text-primary"
                >
                  <Link
                    href={category.href}
                    data-track={category.track}
                    className="transition-colors hover:text-accent dark:hover:text-accent-bright"
                  >
                    {category.title}
                  </Link>
                </h2>
                <span className="text-sm font-medium text-muted dark:text-text-tertiary">
                  {category.subtitle}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <ProductCard key={item.slug} item={item} headingLevel="h3" />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
