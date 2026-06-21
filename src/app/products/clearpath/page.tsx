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
import { getProductEntry } from "@/lib/content/products";
import { breadcrumbTrailForSlug } from "@/lib/portfolio";
import { faqForSlug } from "@/lib/product-faqs";
import { softwareApplicationSchema } from "@/lib/schema/product";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";
const SLUG = "clearpath";

export function generateMetadata(): Metadata {
  const entry = getProductEntry(SLUG);
  if (!entry) return {};
  return pageMetadata({
    title: "ClearPath — Mentale Firewall gegen kognitive Verzerrungen | neckarshore.ai",
    description: entry.definition,
    path: `/products/${SLUG}`,
  });
}

export default function ClearPathPage() {
  const entry = getProductEntry(SLUG);
  // ClearPath is live: a missing liveUrl would be a data error, not a preview state.
  if (!entry || !entry.liveUrl) notFound();
  // Hoist to a local const so the narrowing survives the schema function call below.
  const liveUrl = entry.liveUrl;

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd
        data={softwareApplicationSchema({ ...entry, liveUrl })}
        id="schema-softwareapplication-clearpath"
      />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug(SLUG)} />

        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              {entry.headline}
            </h1>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            {entry.definition}
          </p>

          <div className="mt-8">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track="clearpath_live_cta"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              Live ausprobieren →
            </a>
            <p className="mt-3 text-sm text-muted dark:text-text-tertiary">
              Anonym, ohne Anmeldung.
            </p>
          </div>

          <div className="mt-10">
            <Prose html={entry.bodyHtml} />
          </div>

          <ProductFaq slug={SLUG} items={faqForSlug(SLUG)} />
        </article>

        <ProductDetailNav slug={SLUG} />
      </main>
      <Footer />
    </>
  );
}
