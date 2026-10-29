/**
 * THE NECKAR LINE — contour lines of a river course in the hero's empty right half.
 *
 * Founder decision 2026-10-17 (report 2026-10-17-linus-websites-b): "the waves (Neckar line)
 * are to be built". Design: proposal A of the optics pilot (artifact Fwv846zsUHsgCLPLHVVP6C),
 * paths taken from it unchanged. The wave in the logo becomes the one picture motif of the brand.
 *
 * DECORATION ONLY: `aria-hidden`, no text, no pointer events, no animation — so the global
 * prefers-reduced-motion rule (Founder 2026-10-17) has nothing to stop. It sits BEHIND the copy
 * (copy z-2 over lines z-1), and the existing gradient blob (z auto) stays behind the lines, as the draft says.
 *
 * `xMaxYMid slice` anchors the lines to the right edge: on a phone the viewBox scales to the
 * hero's height and only the right-hand run shows, behind the headline. It is fainter there
 * (`opacity-40`), so it never competes with text it overlaps.
 *
 * Colours: dark mode uses the draft's pair (#22D3EE accent-bright, #0E7490 accent). Light mode
 * uses accent and primary, because #22D3EE on #F1F5F9 is close to invisible.
 */
const LINIEN = [
  { d: "M760 40 C 900 120, 980 60, 1080 150 S 1240 330, 1180 430 S 1060 600, 1220 700 S 1400 760, 1480 720", hell: false, breite: 2.2, deckung: 0.9 },
  { d: "M800 20 C 940 100, 1030 40, 1130 140 S 1290 320, 1235 425 S 1115 590, 1270 690 S 1430 745, 1500 705", hell: false, breite: 1.2, deckung: 0.55 },
  { d: "M720 60 C 860 140, 930 80, 1030 165 S 1190 340, 1125 440 S 1005 610, 1170 712 S 1370 775, 1460 735", hell: true, breite: 1.2, deckung: 0.9 },
  { d: "M845 0 C 985 80, 1080 20, 1180 125 S 1340 305, 1290 415 S 1170 575, 1320 676 S 1460 730, 1520 690", hell: false, breite: 1, deckung: 0.3 },
  { d: "M680 80 C 820 160, 880 100, 980 180 S 1140 350, 1070 452 S 950 622, 1120 725 S 1340 790, 1440 750", hell: true, breite: 1, deckung: 0.6 },
  { d: "M890 0 C 1030 60, 1130 0, 1230 110 S 1390 290, 1345 405 S 1225 560, 1370 662 S 1490 715, 1540 676", hell: false, breite: 1, deckung: 0.16 },
  { d: "M640 100 C 780 180, 830 120, 930 196 S 1090 362, 1015 464 S 895 634, 1070 738 S 1310 805, 1420 765", hell: true, breite: 1, deckung: 0.35 },
] as const;

export default function NeckarLinie() {
  return (
    <svg
      data-neckar-linie
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-40 md:opacity-100"
    >
      <g fill="none" strokeLinecap="round">
        {LINIEN.map((linie) => (
          <path
            key={linie.d}
            d={linie.d}
            strokeWidth={linie.breite}
            opacity={linie.deckung}
            /* `hell` = the darker of the draft's two strokes (#0E7490). In light mode the brighter
               strokes take accent and the darker ones primary. */
            className={linie.hell ? "stroke-primary dark:stroke-accent" : "stroke-accent dark:stroke-accent-bright"}
          />
        ))}
      </g>
    </svg>
  );
}
