import Image from "next/image";

/**
 * Up to three phone screenshots of a native app, side by side, each in a light AND a dark
 * version that follows the site theme (the `dark` class on <html>). Used on the Kaze and
 * MuscleCat detail pages.
 *
 * WHERE THE PICTURES COME FROM: the app's own public page (kaze.neckarshore.ai,
 * musclecat.neckarshore.ai), copied from that repo's `origin/main` on 2026-10-15. They are
 * the pictures the app's own page already shows, not new captures — so both surfaces show
 * the same state, and a later change there is a copy here, not a second judgement.
 *
 * WHY BOTH THEMES: a light phone screen on the dark site (and the reverse) reads as a
 * cut-out. Both <Image> elements are lazy; the hidden one is `display:none`, which Chrome
 * and Safari do not fetch, so a visitor loads one set, not two.
 *
 * Three columns from 393px up: a phone screenshot is tall, and at a third of the column
 * it is still readable as a picture of a screen (not as text — the alt carries that).
 */
export interface AppShot {
  light: string;
  dark: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export function AppScreens({ shots, note }: { shots: AppShot[]; note?: string }) {
  return (
    <figure>
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {shots.map((shot) => (
          <div key={shot.light} className="flex flex-col">
            <div className="overflow-hidden rounded-[14%/6.5%] border border-primary/10 dark:border-text-secondary/15">
              <Image
                src={shot.light}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(max-width: 768px) 31vw, 240px"
                className="block h-auto w-full dark:hidden"
              />
              <Image
                src={shot.dark}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(max-width: 768px) 31vw, 240px"
                className="hidden h-auto w-full dark:block"
              />
            </div>
            <span className="mt-2 text-center text-xs leading-snug text-muted dark:text-text-tertiary sm:text-sm">
              {shot.caption}
            </span>
          </div>
        ))}
      </div>
      {note && (
        <figcaption className="mt-4 text-sm text-muted dark:text-text-tertiary">{note}</figcaption>
      )}
    </figure>
  );
}
