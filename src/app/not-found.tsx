import { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "404 — Seite nicht gefunden — neckarshore.ai",
  description: "Diese Seite existiert nicht. Zurück zur Startseite von neckarshore.ai.",
};

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";

export default function NotFound() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <main className="mx-auto flex min-h-[70vh] max-w-[800px] flex-col items-center justify-center px-4 text-center">
        <p className="font-mono text-sm tracking-widest text-accent">404</p>
        <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl dark:text-text-primary">
          Seite nicht gefunden
        </h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-neutral-dark/70 dark:text-text-secondary">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          Zurück zur Startseite
        </Link>
      </main>
    </>
  );
}
