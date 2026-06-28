import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { PageSchema } from "@/components/PageSchema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductDetailNav } from "@/components/ProductDetailNav";
import { SkillCard } from "@/components/SkillCard";
import { pageMetadata } from "@/lib/seo";
import { entityId } from "@/lib/schema/webpage";
import { breadcrumbTrailForSlug } from "@/lib/portfolio";
import { SKILL_CARDS } from "@/lib/skill-cards";

const showOssLaunch = process.env.OSS_LAUNCH_VISIBLE === "true";
const REPO = "https://github.com/neckarshore-skills/obsidian-vault-autopilot";
const card = SKILL_CARDS["obsidian-vault-autopilot"];

const DEFINITION =
  "Obsidian Vault Autopilot ist eine kostenlose Open-Source-Automatisierung für Obsidian-Vaults: vier Claude-Code-Skills sortieren die Inbox, benennen Notizen um und pflegen die Frontmatter — sicher by Design, MIT-lizenziert.";

export const metadata: Metadata = pageMetadata({
  title: "Obsidian Vault Autopilot — Open-Source-Automation | neckarshore.ai",
  description: DEFINITION,
  path: "/products/obsidian-vault-autopilot",
});

// The four launch-scope skills (source: repo README, validated/stable + one beta).
const skills = [
  {
    code: "inbox-sort",
    text: "Verschiebt Notizen aus dem Inbox-Root in bestehende Unterordner — anhand des Inhalts, nicht nach starren Regeln.",
    status: "stabil",
  },
  {
    code: "note-rename",
    text: "Benennt schlecht benannte Dateien um und aktualisiert dabei sämtliche Backlinks im Vault.",
    status: "stabil",
  },
  {
    code: "property-enrich",
    text: "Füllt fehlende Metadaten: Titel, Daten, Aliase, Quelle, Priorität. Fundament für die anderen Skills.",
    status: "stabil",
  },
  {
    code: "property-describe",
    text: "Erzeugt eine knappe `description`-Frontmatter aus dem Notizinhalt.",
    status: "Beta",
  },
];

// Safety features (source: repo README § Safety — "How Your Data Stays Safe").
const safety = [
  ["Soft-Delete", "Entfernte Dateien wandern mit Recovery-Metadaten nach `_trash/` — nichts wird hart gelöscht."],
  ["Preview + Confirm", "Jede destruktive Aktion zeigt vorher, was sich ändert, und wartet auf deine Freigabe."],
  ["Cooldown", "Dateien jünger als 3 Tage (konfigurierbar) sind vor Automation geschützt."],
  ["Skill-Log", "Jede Aktion wird mit Zeitstempel und Änderung protokolliert — in der Frontmatter und in einer Run-History."],
  ["Secret-Detection", "Dateien mit API-Keys, Recovery-Phrasen oder Finanzdaten werden erkannt und nie unbemerkt einsortiert."],
];

// Mini-FAQ — visible on the page AND emitted as FAQPage JSON-LD (GEO citability).
const faqItems = [
  {
    q: "Was ist Obsidian Vault Autopilot?",
    a: "Eine kostenlose Open-Source-Automatisierung für Obsidian-Vaults, die als Claude-Code-Plugin läuft. Vier Skills sortieren die Inbox, benennen Notizen um, füllen Frontmatter-Metadaten und schreiben Kurzbeschreibungen — automatisch im Hintergrund. MIT-lizenziert.",
  },
  {
    q: "Welche Skills sind enthalten?",
    a: "Vier Skills: inbox-sort (Inbox in Unterordner sortieren), note-rename (umbenennen und alle Backlinks fixen), property-enrich (fehlende Metadaten füllen) und property-describe (Beschreibung aus dem Inhalt erzeugen, Beta). Weitere Skills wie note-quality-check und tag-manage sind auf der Roadmap.",
  },
  {
    q: "Sind meine Daten sicher?",
    a: "Sicherheit ist eingebaut: Soft-Delete (nichts wird hart gelöscht), Preview + Confirm vor jeder destruktiven Aktion, ein Cooldown für neue Dateien, ein vollständiges Skill-Log und Secret-Detection für API-Keys und Finanzdaten. Der Plugin-Code macht selbst keine Netzwerkaufrufe; die Skill-Ausführung läuft über Claude Code, das Notizinhalte zur Generierung an die Anthropic-API sendet.",
  },
  {
    q: "Was kostet Obsidian Vault Autopilot?",
    a: "Nichts. Das Plugin ist Open Source unter MIT-Lizenz und frei auf GitHub verfügbar.",
  },
  {
    q: "Wie installiere ich es?",
    a: "Über den Claude-Code-Marketplace: zuerst den Marketplace hinzufügen, dann das Plugin installieren. Voraussetzung sind Claude Code mit Plugin-Support und ein Obsidian-Vault. Vault-Pfad setzen und loslegen.",
  },
];

// Hand-written SoftwareApplication entity — honest for an OSS Claude-Code plugin:
// operatingSystem per the README's validated platforms (macOS + Windows, NOT Linux),
// softwareRequirements names the host (Claude Code), free Offer (MIT). No fabricated rating.
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": entityId("/products/obsidian-vault-autopilot", "software"),
  name: "Obsidian Vault Autopilot",
  description: DEFINITION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows",
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

export default function ObsidianVaultAutopilotPage() {
  return (
    <>
      <Nav showOssLaunch={showOssLaunch} />
      <PageSchema
        path="/products/obsidian-vault-autopilot"
        name="Obsidian Vault Autopilot"
        primaryEntity={softwareSchema}
      />
      <JsonLd data={faqSchema} id="schema-faqpage-obsidian-vault-autopilot" />
      <main className="mx-auto max-w-[760px] px-4 pt-40 pb-20 md:px-6">
        <Breadcrumbs trail={breadcrumbTrailForSlug("obsidian-vault-autopilot")} />

        {/* Hero = the reusable SkillCard, here as the page H1 + at-a-glance summary. */}
        <SkillCard card={card} headingLevel="h1" />

        <article className="mt-14">
          <section>
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Was ist Obsidian Vault Autopilot?
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Obsidian Vault Autopilot ist eine Open-Source-Automatisierung für Obsidian-Vaults, die
              als Claude-Code-Plugin läuft. Vier Skills übernehmen die lästige Pflegearbeit am Second
              Brain: Sie sortieren die Inbox in die passenden Ordner, benennen schlecht benannte
              Notizen um (und reparieren dabei alle Backlinks), füllen fehlende Frontmatter-Metadaten
              und schreiben knappe Beschreibungen aus dem Inhalt. Du sammelst, findest und denkst — der
              Autopilot übernimmt das Filing. Die Skills arbeiten direkt auf Markdown und
              YAML-Frontmatter, nicht auf Obsidian-internen APIs: Wechselst du morgen zu einem anderen
              Markdown-Tool, funktionieren sie weiter.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Die vier Skills
            </h2>
            <div className="mt-5 space-y-3">
              {skills.map((s) => (
                <div
                  key={s.code}
                  className="flex flex-col gap-1.5 rounded-xl border border-primary/10 bg-white/50 p-4 sm:flex-row sm:items-start sm:gap-4 dark:border-text-secondary/10 dark:bg-surface/40"
                >
                  <div className="flex shrink-0 items-center gap-2 sm:w-[160px]">
                    <code className="rounded bg-primary/5 px-2 py-0.5 text-xs font-semibold text-accent-hover dark:bg-text-secondary/10 dark:text-accent-bright">
                      {s.code}
                    </code>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted dark:text-text-tertiary">
                      {s.status}
                    </span>
                  </div>
                  <span className="text-[15px] leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Sicher by Design
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Der Autopilot führt destruktive Dateioperationen auf deinem Vault aus — deshalb ist
              Sicherheit eingebaut, nicht optional. Empfohlen wird ohnehin, jeden Skill erst an einem
              Klon des Vaults zu testen.
            </p>
            <div className="mt-5 space-y-2.5">
              {safety.map(([title, text]) => (
                <div key={title} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                  <span className="shrink-0 font-heading text-sm font-semibold text-primary sm:w-[150px] dark:text-text-primary">
                    {title}
                  </span>
                  <span className="text-[15px] leading-relaxed text-neutral-dark/75 dark:text-text-secondary/80">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Datenschutz
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Der Plugin-Code selbst macht keine Netzwerkaufrufe — das ist mit <code>grep</code>{" "}
              überprüfbar. Die eigentliche Skill-Ausführung läuft in Claude Code, das Notizinhalte zur
              Generierung der Skill-Ergebnisse an die Anthropic-API sendet. Für datenschutzsensible
              Vaults gilt: erst die Sicherheits-Dokumentation lesen, bevor sensible Inhalte verarbeitet
              werden.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-primary dark:text-text-primary">
              Installation
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
              Über den Claude-Code-Marketplace — jede Zeile als eigene Eingabe:
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-primary/10 bg-neutral-light p-4 text-sm leading-relaxed text-primary/90 dark:border-text-secondary/10 dark:bg-deep-space dark:text-text-secondary">
              <code>{`/plugin marketplace add neckarshore-ai/obsidian-vault-autopilot
/plugin install obsidian-vault-autopilot@neckarshore-ai`}</code>
            </pre>
            <p className="mt-4 text-[15px] leading-relaxed text-muted dark:text-text-tertiary">
              Voraussetzung: Claude Code mit Plugin-Support und ein Obsidian-Vault. Danach den
              Vault-Pfad setzen und einen ersten Skill im Preview-Modus laufen lassen.
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

        <ProductDetailNav slug="obsidian-vault-autopilot" />
      </main>
      <Footer />
    </>
  );
}
