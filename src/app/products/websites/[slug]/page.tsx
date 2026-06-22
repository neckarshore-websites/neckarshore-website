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
import { getWebsiteEntry } from "@/lib/content/websites";
import { breadcrumbTrailForSlug, websiteCaseStudySlugs } from "@/lib/portfolio";
import { faqForSlug } from "@/lib/product-faqs";
import { websiteCaseStudySchema } from "@/lib/schema/website";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

/**
 * Website case-study detail page — /products/websites/[slug].
 *
 * Indexable editorial pages that turn the Websites tier from pure external link-outs
 * into citable portfolio content (proof of work for DACH CTOs). One data-driven
 * template; each website fills the seven content axes (Hero = frontmatter headline +
 * lead; axes 2–7 = the Markdown body headings). Lives UNDER the websites sub-portal
 * segment, so it never collides with the /products/[slug] preview-skeleton route.
 */
export function generateStaticParams() {
  return websiteCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getWebsiteEntry(slug);
  if (!entry) return {};
  return pageMetadata({
    title: `${entry.name} — Website-Projekt | neckarshore.ai`,
    description: entry.lead,
    path: `/products/websites/${slug}`,
  });
}

export default async function WebsiteCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWebsiteEntry(slug);
  if (!entry) notFound();

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd
        data={websiteCaseStudySchema({
          name: entry.name,
          description: entry.lead,
          slug: entry.slug,
          liveUrl: entry.liveUrl,
        })}
        id={`schema-creativework-${entry.slug}`}
      />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug(slug)} />

        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              {entry.headline}
            </h1>
            {/* Domain as a subtitle that links to the live site (Founder request 2026-06-22). */}
            <a
              href={entry.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`website_domain_${entry.slug}`}
              className="mt-3 inline-block font-mono text-base text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
            >
              {entry.name} ↗
            </a>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            {entry.lead}
          </p>

          <div className="mt-8">
            <a
              href={entry.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`website_live_cta_${entry.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-medium text-white transition-all duration-150 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              Website live ansehen ↗
            </a>
          </div>

          {entry.techStack.length > 0 && (
            <ul
              aria-label="Technologie-Stack"
              className="mt-8 flex flex-wrap gap-2"
            >
              {entry.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-accent-hover dark:bg-text-secondary/10 dark:text-accent-bright"
                >
                  {tech}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10">
            <Prose html={entry.bodyHtml} />
          </div>

          <ProductFaq slug={slug} items={faqForSlug(slug)} />

          <p className="mt-10 text-sm italic text-muted dark:text-text-tertiary">
            <span className="font-medium not-italic">Wie dieser Text entstand:</span>{" "}
            KI-beschleunigt aus dem Projekt-Repository zusammengestellt, vom Gründer
            redigiert — dieselbe Arbeitsweise, mit der wir bauen.
          </p>
        </article>

        <ProductDetailNav
          slug={slug}
          hideCtaOnDesktop
          cta={
            <a
              href="https://calendly.com/rauhut/20min"
              target="_blank"
              rel="noopener noreferrer"
              data-track={`website_detail_cta_${entry.slug}`}
              className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
            >
              Kennenlerntermin buchen →
            </a>
          }
        />
      </main>
      <Footer />
    </>
  );
}
