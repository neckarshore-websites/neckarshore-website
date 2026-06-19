import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Prose } from "@/components/Prose";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getProductEntry } from "@/lib/content/products";
import { previewSoftwareApplicationSchema } from "@/lib/schema/product";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";
const SLUG = "phonesis";

/**
 * Preview MMP detail page (in development — no public app yet).
 *
 * Same preview posture as the snakeoil-check page (the 1st of this kind):
 *  - `previewSoftwareApplicationSchema` (no `url`, no `offers`) — AD-19 fail-closed.
 *  - `robots: noindex` — held out of the index + sitemap until the public site launches.
 *  - No "Live ausprobieren" link (there is no public app); the CTA is a discovery call.
 *
 * On launch: add `liveUrl` to the frontmatter, swap to `softwareApplicationSchema`, add the
 * live CTA, drop the `noindex` below AND drop `noindex` on the portfolio item (→ sitemap).
 *
 * NOTE: 2nd preview MMP wrapper (after snakeoil-check). Kept as an explicit Pattern-A copy
 * per the MMP spec — promote both to a shared component at the 3rd wrapper (rule-of-three).
 */
export function generateMetadata(): Metadata {
  const entry = getProductEntry(SLUG);
  if (!entry) return {};
  return {
    ...pageMetadata({
      title: "Phonesis Voicebank — Stimmenarchiv für Familien & Institutionen | neckarshore.ai",
      description: entry.definition,
      path: `/products/${SLUG}`,
    }),
    robots: { index: false, follow: true },
  };
}

export default function PhonesisPage() {
  const entry = getProductEntry(SLUG);
  if (!entry) notFound();

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd
        data={previewSoftwareApplicationSchema({
          name: entry.name,
          definition: entry.definition,
          applicationCategory: entry.applicationCategory,
        })}
        id="schema-softwareapplication-phonesis"
      />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
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
          <Link href="/products/mmps" className="transition-colors hover:text-accent">
            MMPs
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-primary/70 dark:text-text-secondary">{entry.name}</span>
        </nav>

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
              data-track="product_detail_cta_phonesis"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              Über Phonesis sprechen →
            </a>
            <p className="mt-3 text-sm text-muted dark:text-text-tertiary">
              Kurzes Gespräch, 20 Minuten — unverbindlich.
            </p>
          </div>

          <div className="mt-10">
            <Prose html={entry.bodyHtml} />
          </div>
        </article>

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
