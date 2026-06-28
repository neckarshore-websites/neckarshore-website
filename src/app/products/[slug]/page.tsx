import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PageSchema } from "@/components/PageSchema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductDetailNav } from "@/components/ProductDetailNav";
import { pageMetadata } from "@/lib/seo";
import {
  allInternalDetailSlugs,
  breadcrumbTrailForSlug,
  getItemBySlug,
} from "@/lib/portfolio";
import { previewSoftwareApplicationSchema } from "@/lib/schema/product";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

/**
 * Skeleton detail route for in-development products (status: "preview"). Bespoke
 * pages (omnopsis, clearpath — hasOwnPage) and external sites are excluded from
 * generateStaticParams and 404 here, so the static segments + own pages win.
 * Preview pages are noindex (held out of the sitemap) until real content lands.
 */
export function generateStaticParams() {
  return allInternalDetailSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item || item.isExternal) return {};

  const meta = pageMetadata({
    title: `${item.name} — neckarshore.ai`,
    description: item.tagline,
    path: `/products/${item.slug}`,
  });
  return item.noindex ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item || item.isExternal) notFound();
  const path = `/products/${item.slug}`;
  const primaryEntity =
    item.schemaType === "SoftwareApplication"
      ? previewSoftwareApplicationSchema({
          name: item.name,
          definition: item.tagline,
          applicationCategory: item.applicationCategory ?? "BusinessApplication",
          path,
        })
      : undefined;

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <PageSchema path={path} name={item.name} primaryEntity={primaryEntity} />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug(item.slug)} />

        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              {item.name}
            </h1>
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            {item.tagline}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm font-medium text-muted dark:bg-text-secondary/10 dark:text-text-tertiary">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            In Entwicklung
          </div>

          <p className="mt-10 text-base leading-relaxed text-neutral-dark/70 dark:text-text-secondary/80">
            Diese Produktseite wird gerade aufgebaut — ausführliche Inhalte folgen in Kürze.
          </p>
        </article>

        <ProductDetailNav
          slug={item.slug}
          hideCtaOnDesktop
          cta={
            <a
              href="https://calendly.com/rauhut/20min"
              target="_blank"
              rel="noopener noreferrer"
              data-track={`product_detail_cta_${item.slug}`}
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
