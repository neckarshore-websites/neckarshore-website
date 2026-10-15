import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";
import { AppScreens, type AppShot } from "@/components/AppScreens";

const SLUG = "musclecat";

/**
 * MuscleCat — Produktseite einer iPhone-App, die noch nicht im App Store ist.
 *
 * Dieselbe Haltung wie Kaze (siehe dort): kein `liveUrl`, weil es keine App zum
 * Ausprobieren im Browser gibt; musclecat.neckarshore.ai steht als `appSiteUrl` in
 * mmp-cards.ts und wird zum Knopf "Zur Seite der App ↗".
 *
 * DIE BILDER sind drei der Bildschirmfotos, die musclecat.neckarshore.ai selbst zeigt,
 * hell und dunkel, kopiert aus `origin/main` von musclecat-website (15.10.2026). Die
 * Auswahl folgt dem Ablauf, den die Seite beschreibt: Training, Pause, Statistik. Die
 * Alternativtexte sind die der App-Seite.
 */
const DIR = "/images/products/apps";
const SHOTS: AppShot[] = [
  {
    light: `${DIR}/musclecat-training-laeuft-hell.png`,
    dark: `${DIR}/musclecat-training-laeuft-dunkel.png`,
    width: 1206,
    height: 2622,
    alt: "Laufendes Training in MuscleCat nach dem Plan Beine & Core: drei Geräte mit je drei geplanten Sätzen und der Knopf zum Abschließen.",
    caption: "Ein laufendes Training",
  },
  {
    light: `${DIR}/musclecat-satzpause-hell.png`,
    dark: `${DIR}/musclecat-satzpause-dunkel.png`,
    width: 1206,
    height: 2622,
    alt: "MuscleCat im Training: Satz 2 von 3 an der Leg Press, 80 kg und 10 Wiederholungen, darunter läuft die Pausenuhr.",
    caption: "Satz und Pause",
  },
  {
    light: `${DIR}/musclecat-statistik-hell.png`,
    dark: `${DIR}/musclecat-statistik-dunkel.png`,
    width: 1206,
    height: 2622,
    alt: "Statistik in MuscleCat mit persönlichen Rekorden, Trainings pro Woche und Gewichtsverlauf.",
    caption: "Die Statistik",
  },
];

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title: "MuscleCat — Trainingstagebuch fürs Studio | neckarshore.ai",
  });
}

export default function MuscleCatPage() {
  return <ProductDetailPage slug={SLUG} media={<AppScreens shots={SHOTS} />} />;
}
