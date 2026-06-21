import type { Metadata } from "next";
import { SkillDetailPage, SkillSection, SkillChipRow } from "@/components/SkillDetailPage";
import { pageMetadata } from "@/lib/seo";

const REPO = "https://github.com/neckarshore-skills/obsidian-social-scrapers-common";

const DEFINITION =
  "Obsidian Social Scrapers ist eine Open-Source-Familie von Claude-Skills, die öffentliche Profile und Posts von Instagram, LinkedIn und X als neutrale Markdown-Briefings direkt in einen Obsidian-Vault holt — getragen von einem geteilten, stdlib-only Python-Core. MIT-lizenziert.";

export const metadata: Metadata = pageMetadata({
  title: "Obsidian Social Scrapers — Profile & Posts als Vault-Briefings | neckarshore.ai",
  description: DEFINITION,
  path: "/products/social-scrapers",
});

const scrapers = [
  {
    code: "linkedin-scraper",
    text: "Profile samt letzter Posts mit Engagement-Daten (Reaktionen, Kommentare, Reposts) — der reißerische Engagement-Bait-Ton wird zu einem nüchternen Briefing neutralisiert. Public.",
  },
  {
    code: "instagram-scraper",
    text: "Profile und Posts inklusive Reels-Transkription via lokalem Whisper.cpp — kein Cloud-Audio, die Tonspur verlässt deine Maschine nicht. Public.",
  },
  {
    code: "x-scraper",
    text: "Profile mit Tweets, Threads und Quote-Tweets über die offizielle X API v2 (App-only Bearer Token) — ToS-konform, kein Web-Scrape. Privates Repo.",
  },
];

const coreParts = [
  ["tokens", "Einheitliches Handling der Apify- und LLM-Schlüssel — eine Quelle, kein Copy-Paste pro Plugin."],
  ["llm_client", "Provider-agnostischer Completion-Seam (Anthropic oder Ollama) für das Briefing-Polishing — lazy importiert, damit der Core stdlib-importierbar bleibt."],
  ["render_helpers", "Markdown-Rendering: Slugify, Pipe-Escaping, Content-Previews, Tag-Sanitizing — byte-identisch über alle Scraper."],
  ["timestamps", "Einheitliche Zeitstempel-Auflösung für Frontmatter, Logs und Datei-Sortierung."],
];

// Honest SoftwareApplication entity — free MIT OSS, real repo URL, free Offer. The shared
// core is the public, downloadable surface; applicationCategory mirrors the portfolio item.
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Obsidian Social Scrapers",
  description: DEFINITION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS, Windows, Linux",
  softwareRequirements: "Claude Code, Python 3, Apify-Token",
  url: REPO,
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Organization", name: "neckarshore.ai", url: "https://neckarshore.ai" },
} as const;

const faqItems = [
  {
    q: "Was sind die Obsidian Social Scrapers?",
    a: "Eine Familie von drei Claude-Code-Skills, die öffentliche Profile und Posts von Instagram, LinkedIn und X einlesen und als neutrale Markdown-Notizen in deinen Obsidian-Vault schreiben. Statt Engagement-Bait bekommst du ein nüchternes Briefing pro Post. Sie teilen sich einen gemeinsamen, MIT-lizenzierten Python-Core.",
  },
  {
    q: "Welche Plattformen werden unterstützt?",
    a: "Instagram (inkl. Reels-Transkription via lokalem Whisper.cpp), LinkedIn (Profile + Posts mit Engagement-Daten) und X / Twitter (über die offizielle X API v2, ToS-konform). Instagram- und LinkedIn-Scraper sind öffentlich, der X-Scraper liegt in einem privaten Repo.",
  },
  {
    q: "Warum ein geteilter Core?",
    a: "Token-Handling, Markdown-Rendering, Zeitstempel und das LLM-Polishing waren in allen drei Scrapern identisch. Der geteilte Python-Core (_social_common) zieht diese Logik in eine Quelle — stdlib-only, byte-identisch extrahiert, mit eigener Smoke-Test-Suite. Die Plugins vendoren eine Kopie; einen separaten Klon brauchen Endnutzer nicht.",
  },
  {
    q: "Was kostet es?",
    a: "Der geteilte Core ist Open Source unter MIT-Lizenz. Laufende Kosten entstehen nur durch die genutzten Drittdienste: ein Apify-Token für das Abrufen der Profile und — optional — ein LLM-Schlüssel für das Briefing-Polishing (oder lokal via Ollama).",
  },
];

export default function SocialScrapersPage() {
  return (
    <SkillDetailPage slug="social-scrapers" softwareSchema={softwareSchema} faqItems={faqItems} repoUrl={REPO}>
      <SkillSection heading="Was sind die Obsidian Social Scrapers?" className="">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Wer Creator, Wettbewerber oder Accounts beobachtet, will den Inhalt — nicht die auf
          Maximal-Reichweite getrimmte Verpackung. Die Obsidian Social Scrapers holen öffentliche
          Profile und Posts von Instagram, LinkedIn und X in deinen Vault und verwandeln jeden Post
          in ein neutrales Briefing: was gesagt wurde, mit welchen Kennzahlen — ohne den
          Engagement-Bait-Ton. Drei Skills, ein gemeinsamer Python-Core, eine Markdown-Notiz pro Post.
        </p>
      </SkillSection>

      <SkillSection heading="Die drei Scraper">
        <div className="mt-5 space-y-3">
          {scrapers.map((s) => (
            <SkillChipRow key={s.code} label={s.code}>
              {s.text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Ein geteilter Core, keine Duplikation">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Die drei Scraper teilen sich <code>_social_common</code> — einen stdlib-only Python-Core,
          aus dem die gemeinsame Logik byte-identisch extrahiert wurde. Jedes Plugin vendort eine
          Kopie über ein Sync-Skript; eine PyPI-Veröffentlichung gibt es bewusst nicht. Lego-Blocks
          statt drei Mal dieselbe Mechanik.
        </p>
        <div className="mt-5 space-y-3">
          {coreParts.map(([code, text]) => (
            <SkillChipRow key={code} label={code}>
              {text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Neutrale Briefings statt Engagement-Bait">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Roher Social-Text ist auf Reichweite optimiert: Cliffhanger, Hook-Zeilen, künstliche
          Dringlichkeit. Vor dem Schreiben in den Vault läuft jeder Post durch eine LLM-gestützte
          Politur, die den Inhalt in ein sachliches Briefing überführt — die Engagement-Kennzahlen
          bleiben als Daten erhalten, der manipulative Ton fällt weg. Das Polishing läuft
          provider-agnostisch über deinen eigenen Anthropic-Schlüssel oder lokal via Ollama.
        </p>
      </SkillSection>

      <SkillSection heading="Datenschutz & Verfügbarkeit">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Gelesen werden nur öffentliche Profile. Die Instagram-Reels-Transkription läuft lokal über
          Whisper.cpp — die Tonspur verlässt deine Maschine nicht. Der geteilte Core ist Open Source
          unter MIT-Lizenz auf GitHub; Instagram- und LinkedIn-Scraper sind öffentlich, der X-Scraper
          liegt in einem privaten Repo. Für den Abruf wird ein Apify-Token benötigt, fürs Polishing
          optional ein LLM-Schlüssel.
        </p>
      </SkillSection>
    </SkillDetailPage>
  );
}
