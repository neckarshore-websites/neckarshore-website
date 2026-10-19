/**
 * Apple's official "Laden im App Store" badge (German, black), linked to the app's store page.
 *
 * THE ASSET IS APPLE'S, UNCHANGED: `public/images/badges/app-store-de.svg`, downloaded from
 * Apple's marketing tools (tools.applemediaservices.com, locale de-de, black) on 2026-10-19.
 * Apple's guidelines: do not alter the badge, keep clear space around it, and keep it at
 * least 40 px high on screen. It sits at exactly 40 px here.
 *
 * The link's accessible name comes from the image's alt text, which repeats the badge's
 * visible words, so name and visible text match (label-content-name-mismatch).
 */
export function AppStoreBadge({ href, slug }: { href: string; slug: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track={`product_app_store_${slug}`}
      className="inline-block shrink-0 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 9 KB vector, fixed size; Apple's file must stay unaltered, so no optimiser pass. */}
      <img
        src="/images/badges/app-store-de.svg"
        alt="Laden im App Store"
        width={120}
        height={40}
        className="block h-10 w-auto"
      />
    </a>
  );
}
