import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Prose } from "@/components/Prose";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { getAllGlossarEntries, getGlossarEntry } from "@/lib/content/glossar";
import { definedTermSchema } from "@/lib/schema/glossar";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

export function generateStaticParams() {
  return getAllGlossarEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getGlossarEntry(slug);
  if (!entry) return {};
  return pageMetadata({
    title: `${entry.term} — Glossar — neckarshore.ai`,
    description: entry.definition,
    path: `/glossar/${entry.slug}`,
    type: "article",
  });
}

export default async function GlossarEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getGlossarEntry(slug);
  if (!entry) notFound();

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd data={definedTermSchema(entry)} id={`schema-definedterm-${entry.slug}`} />
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
          <Link href="/glossar" className="transition-colors hover:text-accent">
            Glossar
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-primary/70 dark:text-text-secondary">{entry.term}</span>
        </nav>

        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl font-bold text-accent md:text-5xl">
              {entry.term}
            </h1>
            {entry.aliases && (
              <div className="mt-3 text-sm font-medium uppercase tracking-wider text-muted dark:text-text-tertiary">
                auch: {entry.aliases}
              </div>
            )}
          </header>

          <p className="text-xl leading-relaxed text-primary/90 dark:text-text-primary">
            {entry.definition}
          </p>

          <div className="mt-8">
            <Prose html={entry.bodyHtml} />
          </div>
        </article>

        <div className="mt-12 border-t border-primary/5 pt-8 dark:border-text-secondary/10">
          <Link
            href="/glossar"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
          >
            ← Zurück zum Glossar
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
