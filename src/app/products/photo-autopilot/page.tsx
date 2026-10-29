import type { Metadata } from "next";
import { SkillDetailPage, SkillSection, SkillChipRow } from "@/components/SkillDetailPage";
import { pageMetadata } from "@/lib/seo";
import { productOgImage } from "@/lib/product-og";
import { entityId } from "@/lib/schema/webpage";

// Source for every claim on this page: the photo-autopilot README and skills/photo-dedup/SKILL.md,
// read 2026-10-29. Private repo → no url, no Offer.
const DEFINITION =
  "Photo Autopilot ist ein Claude-Code-Skill für die lokale Fotobibliothek: photo-dedup findet doppelte und fast gleiche Fotos, legt sie in einem Bericht zur Prüfung vor und verschiebt Aussortiertes nur auf Bestätigung in einen Quarantäne-Ordner. Gelöscht wird nie. Privat in Entwicklung.";

const META_DESCRIPTION =
  "Photo Autopilot findet doppelte und fast gleiche Fotos in deiner lokalen Bibliothek und legt sie zur Prüfung vor — gelöscht wird nie.";

export const metadata: Metadata = pageMetadata({
  title: "Photo Autopilot — doppelte Fotos finden | neckarshore.ai",
  description: META_DESCRIPTION,
  path: "/products/photo-autopilot",
  image: productOgImage("photo-autopilot"),
});

const steps = [
  {
    code: "scan",
    text: "Liest den Fotoordner und schreibt einen Bericht, den du im Browser öffnest. Der Scan verändert keine einzige Datei; sein Ausgabeordner muss außerhalb der Bibliothek liegen, sonst bricht er ab.",
  },
  {
    code: "stufen",
    text: "Trennt drei Arten: bytegleiche Kopien, Serienbilder, die Sekunden auseinander liegen, und ähnliche Bilder ohne Zeitbezug. Die Gruppen werden getrennt gezählt, damit Sicheres und Wahrscheinliches nie in einer Zahl landen.",
  },
  {
    code: "quarantäne",
    text: "Für eine geprüfte Gruppe verschiebt ein zweites Programm die nicht behaltenen Fotos in einen Quarantäne-Ordner — nur mit dem Bestätigungscode aus dem Bericht. Einen Lösch-Pfad gibt es nicht; ein Test stellt das sicher.",
  },
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": entityId("/products/photo-autopilot", "software"),
  name: "Photo Autopilot",
  description: DEFINITION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS, Windows, Linux",
  softwareRequirements: "Claude Code, Python 3, exiftool",
  author: { "@type": "Organization", name: "neckarshore.ai", url: "https://neckarshore.ai" },
} as const;

const faqItems = [
  {
    q: "Was ist Photo Autopilot?",
    a: "Ein Claude-Code-Skill, der in einem lokalen Fotoordner doppelte und fast gleiche Fotos findet und sie dir in einem Bericht zur Prüfung vorlegt. Aussortiertes wird auf deine Bestätigung in einen Quarantäne-Ordner verschoben, nie gelöscht.",
  },
  {
    q: "Kann es Fotos löschen?",
    a: "Nein. Suchen und Handeln sind zwei getrennte Programme: Der Scan liest nur, die Aktion verschiebt nur. Den Quarantäne-Ordner leerst du selbst in deinem Dateimanager.",
  },
  {
    q: "Funktioniert es mit iCloud oder Google Fotos?",
    a: "Nur mit Fotos, die schon auf deiner Maschine liegen. Der Skill spricht mit keinem Cloud-Dienst; eine Bibliothek aus iCloud oder Google Drive lädst du vorher herunter.",
  },
  {
    q: "Ist der Code verfügbar?",
    a: "Noch nicht öffentlich. Photo Autopilot wird privat entwickelt; photo-dedup ist der erste Skill.",
  },
];

export default function PhotoAutopilotPage() {
  return (
    <SkillDetailPage slug="photo-autopilot" softwareSchema={softwareSchema} faqItems={faqItems}>
      <SkillSection heading="Was ist Photo Autopilot?" className="">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Eine Fotobibliothek sammelt Doppelte an: zweimal importiert, aus einem Export
          zurückgeholt, zehn Serienbilder vom selben Moment. Photo Autopilot findet sie und legt sie
          dir gruppiert zur Prüfung vor. Entscheiden tust du; der Skill schlägt nur vor, welches Foto
          bleibt, und verschiebt den Rest erst auf deine Bestätigung.
        </p>
      </SkillSection>

      <SkillSection heading="So arbeitet photo-dedup">
        <div className="mt-5 space-y-3">
          {steps.map((s) => (
            <SkillChipRow key={s.code} label={s.code}>
              {s.text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Datenschutz & Verfügbarkeit">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Der Scan läuft als Programm auf deiner Maschine und spricht mit keinem Cloud-Dienst.
          Gelöscht wird nichts; Aussortiertes landet in einem Quarantäne-Ordner, den du selbst
          leerst. Photo Autopilot wird privat entwickelt; das Repository ist nicht öffentlich.
        </p>
      </SkillSection>
    </SkillDetailPage>
  );
}
