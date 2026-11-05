/**
 * The ids a blog post may place with a figure marker (`<!-- figur: <id> -->`).
 *
 * Kept apart from the components so the loader and its unit tests can validate markers
 * without importing React. `src/components/blog/figures/index.tsx` maps every id to its
 * component through a `Record<FigureId, …>`, so an id without a component fails the type
 * check, and a marker without an id fails the build (see `splitBody` in blog.ts).
 */
export const FIGURE_IDS = [
  "teststrategie-risikoregister",
  "teststrategie-testlaeufe",
  "teststrategie-vokabular",
] as const;

export type FigureId = (typeof FIGURE_IDS)[number];

export function isFigureId(id: string): id is FigureId {
  return (FIGURE_IDS as readonly string[]).includes(id);
}
