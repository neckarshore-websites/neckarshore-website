import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductDetailNav } from "@/components/ProductDetailNav";
import { SkillCard } from "@/components/SkillCard";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbTrailForSlug } from "@/lib/portfolio";
import { SKILL_CARDS } from "@/lib/skill-cards";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";
const REPO = "https://github.com/neckarshore-skills/ai-phrase-check";
const card = SKILL_CARDS["ai-phrase-check"];

const DEFINITION =
  "AI Phrase Check ist ein kostenloses Open-Source-Schreibwerkzeug, das KI-typische Floskeln in deutschem und englischem Text erkennt — „delve into\", „tapestry\", „tauchen wir ein in\", „im Bereich der\" — und menschlichere Alternativen vorschlägt. Dreistufig nach dem Prinzip „KI schlägt vor, der Mensch entscheidet\". MIT-lizenziert.";

// Quoted runs kept in JS string literals (curly quotes are not string delimiters here) so they
// do not trip react/no-unescaped-entities in JSX text — same pattern as the OVA detail page.
const EXAMPLE_TELLS =
  '„delve into", „tapestry", „navigate the landscape", auf Deutsch „tauchen wir ein in" oder „im Bereich der"';
const MOTTO = '„KI schlägt vor, der Mensch entscheidet"';

export const metadata: Metadata = pageMetadata({
  title: "AI Phrase Check — KI-Floskeln in DE & EN erkennen | neckarshore.ai",
  description: DEFINITION,
  path: "/products/ai-phrase-check",
});

// The three-stage flow (source: repo README — Detect → Suggest → Apply, user gates).
const stages = [
  {
    code: "Erkennen",
    text: "Der Text wird gegen die kuratierte Floskel-Liste geprüft — rein deterministisch über Mustererkennung, ohne KI-Aufruf.",
  },
  {
    code: "Vorschlagen",
    text: "Zu den markierten Stellen entstehen KI-gestützt menschlichere Alternativen.",
  },
  {
    code: "Anwenden",
    text: "Du entscheidest pro Stelle, was übernommen wird — nichts ändert sich ohne deine Freigabe.",
  },
];

// Mini-FAQ — visible on the page AND emitted as FAQPage JSON-LD (GEO citability).
const faqItems = [
  {
    q: "Was ist AI Phrase Check?",
    a: "Ein kostenloses Open-Source-Schreibwerkzeug, das KI-typische Floskeln in deutschem und englischem Text erkennt und menschlichere Alternativen vorschlägt — nach dem Prinzip „KI schlägt vor, der Mensch entscheidet\". MIT-lizenziert.",
  },
  {
    q: "Welche Sprachen werden unterstützt?",
    a: "Deutsch und Englisch gleichermaßen. Die kuratierte Floskel-Liste deckt beide Sprachen ab und wächst mit — 27 Phrasen im MVP, ohne Code-Änderung erweiterbar.",
  },
  {
    q: "Verlässt mein Text meine Maschine?",
    a: "Die Erkennung läuft lokal über Mustererkennung, ohne KI-Aufruf — dabei verlässt nichts deinen Rechner. Die KI-gestützte Vorschlagsstufe in der Web-App nutzt deinen eigenen Anthropic-API-Schlüssel, der ausschließlich in der sessionStorage deines Browsers liegt. Es gibt kein Backend.",
  },
  {
    q: "Was kostet AI Phrase Check?",
    a: "Nichts. AI Phrase Check ist Open Source unter MIT-Lizenz und frei auf GitHub verfügbar.",
  },
  {
    q: "Wie nutze ich es?",
    a: "Als Open-Source-Claude-Code-Skill: Quellcode und die kuratierten Phrasen-Listen liegen auf GitHub. Eine Web-App mit interaktiver In-Browser-Demo ist in Arbeit.",
  },
];

// Hand-written SoftwareApplication entity — honest for a free MIT OSS Claude-Code skill:
// real repo URL, free Offer (MIT), softwareRequirements names the host (Claude Code).
// applicationCategory = DeveloperApplication (sibling-consistent with obsidian-vault-autopilot;
// both Claude-Code skills). No fabricated rating, no marketplace command (not yet published).
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Phrase Check",
  description: DEFINITION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux",
  softwareRequirements: "Claude Code",
  url: REPO,
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Organization", name: "neckarshore.ai", url: "https://neckarshore.ai" },
} as const;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
} as const;

export default function AiPhraseCheckPage() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <JsonLd data={softwareSchema} id="schema-softwareapplication-ai-phrase-check" />
      <JsonLd data={faqSchema} id="schema-faqpage-ai-phrase-check" />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug("ai-phrase-check")} />

        {/* Hero = the reusable SkillCard, here as the page H1 + at-a-glance summary. */}
        <SkillCard card={card} headingLevel="h1" />

        <article className="mt-14">
          <section>
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Was ist AI Phrase Check?
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              AI Phrase Check spürt die verräterischen Spuren von KI-generierter Sprache auf. Wer mit
              LLMs schreibt, sammelt mit der Zeit typische Floskeln an — {EXAMPLE_TELLS}. Diese
              Tells schwächen die eigene Stimme und verraten flüchtiges Lektorat. AI Phrase Check
              markiert sie und schlägt menschlichere Formulierungen vor — in beiden Sprachen, aus
              einer kuratierten, wachsenden Liste (27 Phrasen im MVP). Bestehende Prosa-Linter wie
              proselint oder write-good zielen weder auf Post-LLM-Floskeln noch auf Deutsch; genau
              diese Lücke füllt AI Phrase Check.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Wie es funktioniert
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Drei Stufen, mit einer Freigabe zwischen jeder — nach dem Prinzip {MOTTO}:
            </p>
            <div className="mt-5 space-y-3">
              {stages.map((s) => (
                <div
                  key={s.code}
                  className="flex flex-col gap-1.5 rounded-xl border border-primary/10 bg-white/50 p-4 sm:flex-row sm:items-start sm:gap-4 dark:border-text-secondary/10 dark:bg-surface/40"
                >
                  <span className="shrink-0 font-heading text-sm font-semibold text-accent-hover sm:w-[140px] dark:text-accent-bright">
                    {s.code}
                  </span>
                  <span className="text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-muted dark:text-text-tertiary">
              Dieselbe Logik wird aus einer Quelle in zwei Formen ausgeliefert: als Claude-Code-Skill
              fürs Schreiben direkt im Editor und als Web-App mit interaktiver Demo im Browser.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Zweisprachig: Englisch und Deutsch
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Der Differenziator: AI Phrase Check arbeitet für deutschen und englischen Text
              gleichermaßen. Die Floskel-Listen liegen als einfache, kuratierte Markdown-Daten im
              Repository — neue Tells lassen sich ohne Code-Änderung ergänzen, und die Liste wächst
              mit. Beide Konsumenten, Skill und Web-App, lesen dieselbe Quelle: ein Stand, zwei
              Oberflächen.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Datenschutz
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Kein Backend, kein Server, der deinen Text sieht. Die Erkennungsstufe läuft lokal über
              Mustererkennung — kein KI-Aufruf, nichts verlässt deine Maschine. Die KI-gestützte
              Vorschlagsstufe in der Web-App funktioniert per Bring-Your-Own-Key: Du hinterlegst
              deinen eigenen Anthropic-API-Schlüssel, der ausschließlich in der{" "}
              <code>sessionStorage</code> deines Browsers bleibt und mit dem Tab verschwindet. Als
              Claude-Code-Skill läuft die Ausführung in deiner Claude-Code-Umgebung.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Verfügbarkeit
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              AI Phrase Check ist Open Source unter MIT-Lizenz und frei auf GitHub verfügbar — als
              Claude-Code-Skill samt der kuratierten Phrasen-Listen. Eine Web-App mit interaktiver
              In-Browser-Demo ist in Arbeit. Der Quellcode ist der verlässliche Startpunkt; der Link
              unten führt direkt zum Repository.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Häufige Fragen
            </h2>
            <div className="mt-5 space-y-4">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-primary/10 bg-white/50 p-5 open:bg-white dark:border-text-secondary/10 dark:bg-surface/40 dark:open:bg-surface"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-heading text-base font-semibold text-primary dark:text-text-primary">
                    {item.q}
                    <span className="ml-4 text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <p className="mt-10 text-sm italic text-muted dark:text-text-tertiary">
          <span className="font-medium not-italic">Wie dieser Text entstand:</span> KI-beschleunigt
          aus der README und Repo-Dokumentation des Projekts zusammengestellt, vom Gründer redigiert.
        </p>

        <ProductDetailNav
          slug="ai-phrase-check"
          cta={
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              data-track="ai_phrase_check_detail_github"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-hover dark:text-accent-bright"
            >
              Auf GitHub ansehen →
            </a>
          }
        />
      </main>
      <Footer />
    </>
  );
}
