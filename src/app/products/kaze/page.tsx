import type { Metadata } from "next";
import ProductDetailPage, {
  productDetailMetadata,
} from "@/components/ProductDetailPage";
import { AppScreens, type AppShot } from "@/components/AppScreens";

const SLUG = "kaze";

/**
 * Kaze — Produktseite einer iPhone-App, seit 18.10.2026 im App Store (DE, AT, CH). Das
 * App-Store-Abzeichen und der Instagram-Link kommen aus mmp-cards.ts (`appStoreUrl`, `socials`).
 *
 * KEIN `liveUrl` IM FRONTMATTER, und das ist eine Entscheidung, keine Luecke: die App ist
 * nicht im App Store. `liveUrl` schaltet im Baustein das Live-Schema samt "Live
 * ausprobieren" scharf; wer darauf klickte, bekaeme eine weitere Textseite statt eines
 * Produkts. kaze.neckarshore.ai steht deshalb als `appSiteUrl` in mmp-cards.ts — der
 * Baustein macht daraus "Zur Seite der App ↗" statt des Gespraechs-Knopfs.
 *
 * DIE BILDER (seit 15.10.2026, vorher nur das App-Icon): dieselben drei Bildschirmfotos,
 * die kaze.neckarshore.ai auf seiner Startseite zeigt, hell und dunkel, kopiert aus
 * `origin/main` von kaze-website. Bis dahin stand hier das Icon, weil es keine
 * abgenommenen Bildschirmfotos gab; die gibt es jetzt, auf der eigenen Seite der App. Die
 * Beschriftungen folgen den dortigen, die Alternativtexte ebenso.
 */
const DIR = "/images/products/apps";
const SHOTS: AppShot[] = [
  {
    light: `${DIR}/kaze-hell-02e-einrichten-mit-weiteren.webp`,
    dark: `${DIR}/kaze-dunkel-02e-einrichten-mit-weiteren.webp`,
    width: 1080,
    height: 2090,
    alt: "Bildschirm „Wer soll erst mal Ruhe geben?“ mit fünf gewählten Apps, 4 Stunden Dauer und dem Riegel Anwenden.",
    caption: "Auswahl und Dauer",
  },
  {
    light: `${DIR}/kaze-hell-03-verriegelt.webp`,
    dark: `${DIR}/kaze-dunkel-03-verriegelt.webp`,
    width: 1080,
    height: 2090,
    alt: "Übersicht „Verriegelt“ mit zwei aktiven Sperren, YouTube und Instagram, jede mit ihrer Restzeit.",
    caption: "Die laufenden Sperren",
  },
  {
    light: `${DIR}/kaze-hell-04-detail.webp`,
    dark: `${DIR}/kaze-dunkel-04-detail.webp`,
    width: 1080,
    height: 2090,
    alt: "Zifferblatt mit der Restzeit 1:52 für Instagram, darunter der Knopf Entriegeln.",
    caption: "Die Uhr einer Sperre",
  },
];

export function generateMetadata(): Metadata {
  return productDetailMetadata({
    slug: SLUG,
    title: "Kaze — Apps für eine Weile weglegen | neckarshore.ai",
  });
}

export default function KazePage() {
  return <ProductDetailPage slug={SLUG} media={<AppScreens shots={SHOTS} />} />;
}
