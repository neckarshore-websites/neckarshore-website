import type { Metadata } from "next";
import { SkillDetailPage, SkillSection, SkillChipRow } from "@/components/SkillDetailPage";
import { pageMetadata } from "@/lib/seo";
import { productOgImage } from "@/lib/product-og";
import { entityId } from "@/lib/schema/webpage";

// Source for every claim on this page: the paperless-autopilot README at v0.4.0 (status line,
// skills table, "What leaves your machine"), read 2026-10-29. Private repo → no url, no Offer.
const DEFINITION =
  "Paperless Autopilot ist eine Gruppe von drei Claude-Code-Skills für Paperless-ngx: Sie schlagen für jedes Dokument Titel, Typ, Korrespondent und Tags vor, stellen Auswertungen über viele Dokumente zusammen und führen offene Rechnungen mit Betrag und Fälligkeit. Version 0.4.0, Beta, privat entwickelt.";

const META_DESCRIPTION =
  "Paperless Autopilot ordnet Dokumente in Paperless-ngx, stellt Auswertungen zusammen und führt offene Rechnungen — es schlägt vor, du entscheidest.";

export const metadata: Metadata = pageMetadata({
  title: "Paperless Autopilot — Claude-Skills für Paperless-ngx | neckarshore.ai",
  description: META_DESCRIPTION,
  path: "/products/paperless-autopilot",
  image: productOgImage("paperless-autopilot"),
});

const skills = [
  {
    code: "paperless-classify",
    text: "Schlägt pro Dokument Titel, Dokumenttyp, Korrespondent und Tags vor und setzt sie erst nach deiner Bestätigung. Dry-run als Default; der vorherige Stand wird protokolliert, damit du zurückrollen kannst.",
  },
  {
    code: "paperless-query",
    text: "Stellt Dokumente übergreifend zusammen, z. B. alle Steuerunterlagen eines Jahres: Filter über deine vorhandenen Kategorien plus Volltextsuche, eine Ergebnisliste und ein gespeicherter Bericht. Liest nur.",
  },
  {
    code: "paperless-extractor",
    text: "Schlägt pro Rechnung Betrag und Fälligkeit vor, listet offene und überfällige Rechnungen mit Summen je Währung, und du markierst Bezahltes. Andere Zusatzfelder fasst es nicht an.",
  },
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": entityId("/products/paperless-autopilot", "software"),
  name: "Paperless Autopilot",
  description: DEFINITION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS, Windows, Linux",
  softwareRequirements: "Claude Code, Python 3, Paperless-ngx mit API-Token",
  softwareVersion: "0.4.0",
  author: { "@type": "Organization", name: "neckarshore.ai", url: "https://neckarshore.ai" },
} as const;

const faqItems = [
  {
    q: "Was ist Paperless Autopilot?",
    a: "Drei Claude-Code-Skills für Paperless-ngx, die Dokumente ordnen, Auswertungen zusammenstellen und offene Rechnungen führen. Sie schlagen vor, du entscheidest — nichts wird ohne deine Bestätigung geschrieben. Version 0.4.0, Beta.",
  },
  {
    q: "Was verlässt meine Maschine?",
    a: "Die Einordnung macht Claude. Deshalb gehen der OCR-Text der bearbeiteten Dokumente, ihre Metadaten und — wenn der Text zu dünn ist — die Seiten als Bild an den Claude-Endpunkt deiner eigenen Claude-Code-Sitzung. Einen rein lokalen Modus gibt es nicht. Dein API-Token, deine Einstellungen und das Protokoll fürs Zurückrollen bleiben auf deiner Maschine.",
  },
  {
    q: "Was brauche ich dafür?",
    a: "Eine laufende Paperless-ngx-Instanz mit API-Token, Claude Code und Python 3. Die Skripte kommen ohne zusätzliche Python-Pakete aus.",
  },
  {
    q: "Ist der Code verfügbar?",
    a: "Noch nicht öffentlich. Paperless Autopilot wird privat weiterentwickelt; alle drei Skills laufen bereits gegen eine echte Paperless-ngx-Instanz.",
  },
];

export default function PaperlessAutopilotPage() {
  return (
    <SkillDetailPage slug="paperless-autopilot" softwareSchema={softwareSchema} faqItems={faqItems}>
      <SkillSection heading="Was ist Paperless Autopilot?" className="">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Paperless-ngx macht aus Papier durchsuchbare Dokumente. Ordnen musst du sie trotzdem:
          Titel, Typ, Absender, Tags, und bei Rechnungen Betrag und Fälligkeit. Paperless Autopilot
          übernimmt diese Arbeit als Vorschlag. Jede Änderung zeigt es dir vorher, gesetzt wird
          erst nach deiner Bestätigung, und der vorherige Stand bleibt protokolliert.
        </p>
      </SkillSection>

      <SkillSection heading="Die drei Skills">
        <div className="mt-5 space-y-3">
          {skills.map((s) => (
            <SkillChipRow key={s.code} label={s.code}>
              {s.text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Datenschutz & Verfügbarkeit">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Die Skills laufen auf deiner Maschine und sprechen direkt mit deiner Paperless-Instanz.
          Die Einordnung selbst macht Claude in deiner eigenen Claude-Code-Sitzung: Dokumenttext,
          Metadaten und bei Bedarf die Seiten als Bild gehen an den Claude-Endpunkt, den deine
          Sitzung nutzt. Einen rein lokalen Modus gibt es nicht — Dokumente, die du nicht senden
          willst oder darfst, gehören nicht hinein. An neckarshore.ai geht nichts. Paperless
          Autopilot wird privat weiterentwickelt; das Repository ist nicht öffentlich.
        </p>
      </SkillSection>
    </SkillDetailPage>
  );
}
