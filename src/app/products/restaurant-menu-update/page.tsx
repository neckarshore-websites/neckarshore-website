import type { Metadata } from "next";
import { SkillDetailPage, SkillSection, SkillChipRow } from "@/components/SkillDetailPage";
import { pageMetadata } from "@/lib/seo";
import { previewSoftwareApplicationSchema } from "@/lib/schema/product";
import { faqForSlug } from "@/lib/product-faqs";

const DEFINITION =
  "Restaurant-Menüpflege verwandelt das wiederkehrende Menü-Update eines Restaurants in einen geprüften, reproduzierbaren Vorgang — von der Rohkarte bis zum fertigen Pull Request mit Vorschau-Deploy. Ein bespoke Kundenprojekt, hier anonymisiert als Referenz.";

// noindex: a PRIVATE, genericized client skill (no public repo). Held out of the sitemap
// (portfolio.ts keeps `noindex: true`); the robots meta here matches that posture.
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Restaurant-Menüpflege — Menü-Update als reproduzierbarer Workflow | neckarshore.ai",
    description: DEFINITION,
    path: "/products/restaurant-menu-update",
  }),
  robots: { index: false, follow: true },
};

const steps = [
  ["quellen-parsing", "Liest die Karte aus PDF, Foto oder Freitext ein und zerlegt sie in einzelne Gerichte und Weine."],
  ["allergen-check", "Gleicht jeden Allergen- und Zusatzstoff-Code (LMIV / ZZulV) gegen die zentrale Referenz ab — unbekannte Codes werden gemeldet, nie geraten."],
  ["umlaut-fix", "Korrigiert ASCII-Schreibweisen aus alten Word-Vorlagen zu echten Umlauten und ß (Kaese → Käse); italienische Gerichtnamen bleiben im Original."],
  ["pr-preview", "Build, Lint und Konsistenz-Check laufen automatisch; öffnet einen Pull Request mit Test-Plan und Vercel-Vorschau zur Freigabe."],
];

// Preview SoftwareApplication entity — honest for a PRIVATE skill: name + description +
// category only, NO url / NO Offer (there is no public repo or download). Mirrors the
// [slug] skeleton's preview schema. The page is noindex, so this is for on-site consistency,
// not search indexing.
const softwareSchema = previewSoftwareApplicationSchema({
  name: "Restaurant-Menüpflege",
  definition: DEFINITION,
  applicationCategory: "DeveloperApplication",
});

export default function RestaurantMenuUpdatePage() {
  return (
    <SkillDetailPage
      slug="restaurant-menu-update"
      softwareSchema={softwareSchema}
      faqItems={faqForSlug("restaurant-menu-update")}
      textOrigin="Aus der internen Skill-Dokumentation des Kundenprojekts zusammengestellt, vom Gründer redigiert. Der Kundenname ist bewusst anonymisiert."
    >
      <SkillSection heading="Was ist die Restaurant-Menüpflege?" className="">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Ein Restaurant ändert seine Karte regelmäßig — und jedes Mal droht derselbe fehleranfällige
          Handlauf: Gerichte abtippen, Allergene zuordnen, Umlaute aus alten Word-Vorlagen reparieren,
          die Website aktualisieren. Dieser Skill macht daraus einen geprüften, reproduzierbaren
          Vorgang: Der Inhaber liefert die neue Karte als PDF, Foto oder Text — heraus kommen
          publikationsreife Website-Inhalte und ein fertiger Pull Request mit Vorschau-Deploy zur
          Abnahme.
        </p>
      </SkillSection>

      <SkillSection heading="Wie es funktioniert">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Vier Schritte, jeder geprüft, mit einer Freigabe am Ende — nichts geht ungesehen live:
        </p>
        <div className="mt-5 space-y-3">
          {steps.map(([code, text]) => (
            <SkillChipRow key={code} label={code}>
              {text}
            </SkillChipRow>
          ))}
        </div>
      </SkillSection>

      <SkillSection heading="Ein Referenz-Beispiel">
        <p className="mt-3 text-lg leading-relaxed text-neutral-dark/80 dark:text-text-secondary">
          Dieser Skill ist im Rahmen eines konkreten Kundenprojekts entstanden und liegt in einem
          privaten Repository — es gibt keinen öffentlichen Download. Er steht hier als Referenz
          dafür, wie ein wiederkehrender, fehleranfälliger Pflegevorgang in einen sicheren,
          reproduzierbaren Workflow überführt wird. Lässt sich derselbe Vorgang in deinem Betrieb
          automatisieren? Dann lass uns reden.
        </p>
      </SkillSection>
    </SkillDetailPage>
  );
}
