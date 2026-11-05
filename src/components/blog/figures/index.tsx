import type { ComponentType } from "react";
import type { FigureId } from "@/lib/content/blog-figures";
import { RisikoregisterFigure, TestlaeufeFigure, VokabularFigure } from "./Teststrategie";

/**
 * Figure id → component. A `Record<FigureId, …>`, so an id registered in blog-figures.ts
 * without a component here fails the type check, not the reader.
 */
export const FIGURES: Record<FigureId, ComponentType> = {
  "teststrategie-risikoregister": RisikoregisterFigure,
  "teststrategie-testlaeufe": TestlaeufeFigure,
  "teststrategie-vokabular": VokabularFigure,
};
