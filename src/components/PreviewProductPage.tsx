import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Prose } from "@/components/Prose";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductDetailNav } from "@/components/ProductDetailNav";
import { ProductFaq } from "@/components/ProductFaq";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbTrailForSlug } from "@/lib/portfolio";
import { getProductEntry } from "@/lib/content/products";
import { faqForSlug } from "@/lib/product-faqs";
import { previewSoftwareApplicationSchema } from "@/lib/schema/product";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

/**
 * Shared preview-MMP detail page (in development — no public app yet).
 *
 * Extracted at the 3rd preview wrapper (snakeoil-check + phonesis + prod-or-pretend) per
 * rule-of-three; behaviour-preserving over the two hand-written predecessors. Each MMP page
 * is now a ~12-line wrapper: a SLUG, the bespoke SEO title, and (optionally) a short CTA noun.
 *
 * Preview posture (every preview MMP, by design):
 *  - `previewSoftwareApplicationSchema` (no `url`, no `offers`) — emitting a live URL or a free
 *    Offer for a product that is neither would be a false structured-data claim (AD-19, fail-closed).
 *  - `robots: noindex` — held out of the index + sitemap until the public app launches.
 *  - No "Live ausprobieren" link (there is no public app); the CTA is a discovery call.
 *
 * On launch: add `liveUrl` to the frontmatter, swap to `softwareApplicationSchema`, add the live
 * CTA, drop `robots.noindex` here AND `noindex` on the portfolio item (→ the page enters the sitemap).
 */

/** Shared `generateMetadata` for a preview MMP page. `title` is the bespoke SEO `<title>`. */
export function previewProductMetadata({
  slug,
  title,
}: {
  slug: string;
  title: string;
}): Metadata {
  const entry = getProductEntry(slug);
  if (!entry) return {};
  return {
    ...pageMetadata({ title, description: entry.definition, path: `/products/${slug}` }),
    robots: { index: false, follow: true },
  };
}

interface PreviewProductPageProps {
  slug: string;
  /** Discovery-CTA noun. Defaults to the product name; Phonesis uses a short form. */
  ctaName?: string;
}

export default function PreviewProductPage({ slug, ctaName }: PreviewProductPageProps) {
  const entry = getProductEntry(slug);
  if (!entry) notFound();
  const cta = ctaName ?? entry.name;

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd
        data={previewSoftwareApplicationSchema({
          name: entry.name,
          definition: entry.definition,
          applicationCategory: entry.applicationCategory,
        })}
        id={`schema-softwareapplication-${slug}`}
      />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug(slug)} />

        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              {entry.headline}
            </h1>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            {entry.definition}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            In Entwicklung
          </div>

          <div className="mt-8">
            <a
              href="https://calendly.com/rauhut/20min"
              target="_blank"
              rel="noopener noreferrer"
              data-track={`product_detail_cta_${slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              Über {cta} sprechen →
            </a>
            <p className="mt-3 text-sm text-muted dark:text-text-tertiary">
              Kurzes Gespräch, 20 Minuten — unverbindlich.
            </p>
          </div>

          <div className="mt-10">
            <Prose html={entry.bodyHtml} />
          </div>

          <ProductFaq slug={slug} items={faqForSlug(slug)} />
        </article>

        <ProductDetailNav slug={slug} />
      </main>
      <Footer />
    </>
  );
}
