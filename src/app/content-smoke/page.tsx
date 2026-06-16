// TEMPORARY route — proves the ported content-collection pipeline (Task 1).
// Removed in Task 2 once the real /glossar + /products routes consume the loader.
import { notFound } from "next/navigation";
import { readEntry } from "@/lib/content/collection";
import { renderMarkdown } from "@/lib/content/markdown";
import { Prose } from "@/components/Prose";

interface SmokeData {
  title: string;
}

export default function ContentSmoke() {
  const entry = readEntry<SmokeData>("_smoke", "ping");
  if (!entry) notFound();
  const html = renderMarkdown(entry.body);
  return (
    <main className="mx-auto max-w-[800px] px-4 pt-40 pb-20 md:px-6">
      <h1 className="font-heading text-4xl font-bold text-accent">{entry.data.title}</h1>
      <article className="mt-8">
        <Prose html={html} />
      </article>
    </main>
  );
}
