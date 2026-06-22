import type { Metadata } from "next";
import { SkillDetailPage, SkillSection, SkillChipRow } from "@/components/SkillDetailPage";
import { pageMetadata } from "@/lib/seo";

const REPO = "https://github.com/neckarshore-skills/imap-mailbox-cleanup";

const DEFINITION =
  "IMAP Mailbox Cleanup ist ein kostenloser Open-Source-Hybrid aus CLI und Claude-Skill, der ein großes IMAP-Postfach nach klaren Regeln aufräumt — Dry-run als Default, jede Aktion audit-logged, ausschließlich Soft-Delete. MIT-lizenziert.";

export const metadata: Metadata = pageMetadata({
  title: "IMAP Mailbox Cleanup — regelbasierte Postfach-Triage, dry-run first | neckarshore.ai",
  description: DEFINITION,
  path: "/products/imap-mailbox-cleanup",
});

const pieces = [
  {
    code: "CLI",
    text: "Python mit click und imap-tools: atomare Subcommands mit JSON-Ausgabe, zustandslos und testbar (pytest gegen einen echten IMAP-Server in Docker). Auch allein nutzbar.",
  },
  {
    code: "Claude-Skill",
    text: "Konversationeller Orchestrator, der die CLI in einer Discovery → Preview → Apply-Schleife führt — und vor jeder destruktiven Aktion fragt.",
  },
];

const safety = [
  ["dry-run", "Jeder destruktive Subcommand ist standardmäßig ein Dry-run. Erst --apply tut wirklich etwas."],
  ["soft-delete", "Löschen verschiebt nach Papierkorb / Trash (RFC-6154-Special-Use mit Fallbacks). Kein EXPUNGE in v1 — nichts wird hart gelöscht."],
  ["audit-log", "Jede --apply-Aktion hängt eine JSON-Zeile an: Zeitstempel, Account, Argumente, Ordner, betroffene UIDs, Ergebnis."],
  ["keychain", "Passwörter liegen im macOS-Keychain (via keyring) — kein .env, kein Klartext. Pro E-Mail ein Eintrag."],
];

// Honest SoftwareApplication entity — free MIT OSS hybrid (CLI + Claude-Code skill): real
// repo URL, free Offer, softwareRequirements names the hosts. applicationCategory mirrors
// the portfolio item. No fabricated rating.
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "IMAP Mailbox Cleanup",
  description: DEFINITION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS, Linux",
  softwareRequirements: "Claude Code, Python 3.11+",
  url: REPO,
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://opensource.org/licenses/MIT",
  author: { "@type": "Organization", name: "neckarshore.ai", url: "https://neckarshore.ai" },
} as const;

const faqItems = [
  {
    q: "Was ist IMAP Mailbox Cleanup?",
    a: "Ein Hybrid aus Kommandozeilen-Tool und Claude-Code-Skill, der ein IMAP-Postfach nach konfigurierbaren Regeln triagiert und aufräumt. Die CLI macht die Arbeit (zustandslos, testbar), der Skill führt dich konversationell durch Discovery, Vorschau und Anwendung. Open Source unter MIT-Lizenz.",
  },
  {
    q: "Kann es versehentlich Mails löschen?",
    a: "Der Default ist Dry-run — es passiert nichts, bis du explizit --apply setzt. Gelöscht heißt Soft-Delete in den Papierkorb (kein EXPUNGE in v1), und der Skill zeigt vor jeder destruktiven Aktion erst die Vorschau aus einem Dry-run und fragt nach. Jede Aktion landet zusätzlich im Audit-Log.",
  },
  {
    q: "Wo liegen meine Zugangsdaten?",
    a: "Im macOS-Keychain (über keyring), ein Eintrag pro E-Mail-Adresse — kein .env, kein Klartext. Verbindungseinstellungen liegen in einer lokalen Config-Datei mit Mode 0600. Das Tool ist mehr-Account-fähig.",
  },
  {
    q: "Funktioniert es mit meinem Anbieter?",
    a: "Es spricht Standard-IMAP und wurde gegen IONOS-Postfächer entwickelt und getestet — in einer realen Sitzung von 7.982 auf 690 Nachrichten (−91 %). Andere IMAP-Anbieter sind grundsätzlich möglich; getestet ist primär IONOS.",
  },
];

export default function ImapMailboxCleanupPage() {
  return (
    <SkillDetailPage slug="imap-mailbox-cleanup" softwareSchema={softwareSchema} faqItems={faqItems}>
      <SkillSection heading="Was ist IMAP Mailbox Cleanup?" className="">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Ein über Jahre gewachsenes Postfach lässt sich nicht in einer Sitzung von Hand bändigen.
          IMAP Mailbox Cleanup macht die Triage zu einem regelbasierten, nachvollziehbaren Vorgang:
          Du beschreibst, was weg soll — nach Absender, Alter, Betreff oder Ordner — und das Tool
          zeigt erst, was passieren würde, bevor irgendetwas bewegt wird. In einer realen Sitzung
          schrumpfte ein IONOS-Postfach so von 7.982 auf 690 Nachrichten (−91 %), ohne dass etwas
          unwiederbringlich verloren ging.
        </p>
      </SkillSection>

      <SkillSection heading="CLI + Skill: warum hybrid">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Eine reine CLI würde dich Subcommands auswendig lernen und JSON lesen lassen; ein reiner
          Skill würde die IMAP-Logik in Markdown drücken — fragil und untestbar. Der Hybrid hält die
          Engine testbar und die Bedienung konversationell:
        </p>
        <div className="mt-5 space-y-3">
          {pieces.map((p) => (
            <SkillChipRow key={p.code} label={p.code}>
              {p.text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Sicherheitsmodell">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Das Tool führt destruktive Operationen auf deinem Postfach aus — deshalb ist Sicherheit
          eingebaut, nicht optional:
        </p>
        <div className="mt-5 space-y-3">
          {safety.map(([code, text]) => (
            <SkillChipRow key={code} label={code}>
              {text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Datenschutz & Verfügbarkeit">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Das Tool läuft direkt zwischen deiner Maschine und deinem IMAP-Server — kein
          Cloud-Zwischenstopp, keine Kopie deiner Mails irgendwo anders. Passwörter liegen im
          System-Keychain, jede Aktion im lokalen Audit-Log. Es ist Open Source unter MIT-Lizenz und
          frei auf GitHub verfügbar; der Link unten führt direkt zum Repository.
        </p>
      </SkillSection>
    </SkillDetailPage>
  );
}
