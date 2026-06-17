import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/seo";
import { getAllGlossarEntries } from "@/lib/content/glossar";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

export const metadata: Metadata = pageMetadata({
  title: "Glossar — Kognitive Verzerrungen | neckarshore.ai",
  description:
    "Ein kuratiertes Glossar kognitiver Verzerrungen — jeder Denkfehler in einem Satz erklärt, mit Kontext und Bezug zu ClearPath, dem mentalen Firewall gegen Verzerrungen.",
  path: "/glossar",
});

export default function GlossarIndex() {
  const entries = getAllGlossarEntries();

  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <main className="mx-auto max-w-[860px] px-4 pt-40 pb-20 md:px-6">
        <header className="max-w-[640px]">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-accent">
            Glossar
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary dark:text-text-primary md:text-5xl">
            Kognitive Verzerrungen
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
            Denkfehler, die Entscheidungen verzerren — jeweils in einem Satz erklärt. Jeder
            Eintrag ist ein eigenständiger Baustein und verweist auf{" "}
            <Link
              href="/products/clearpath"
              className="text-accent underline-offset-2 hover:text-accent-hover dark:text-accent-bright"
            >
              ClearPath
            </Link>
            , den mentalen Firewall gegen diese Verzerrungen.
          </p>
        </header>

        <ul className="mt-12 space-y-3">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/glossar/${entry.slug}`}
                className="group block rounded-xl border border-primary/5 bg-white/50 p-6 transition-all hover:border-accent/30 hover:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:hover:bg-surface"
              >
                <h2 className="font-heading text-xl font-semibold text-primary transition-colors group-hover:text-accent dark:text-text-primary">
                  {entry.term}
                </h2>
                <p className="mt-2 leading-relaxed text-neutral-dark/75 dark:text-text-secondary">
                  {entry.definition}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
