import type { Metadata } from "next";
import SubPortal from "@/components/SubPortal";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";

const category = PORTFOLIO.find((c) => c.id === "skills")!;
const description =
  "Fokussierte Open-Source-Werkzeuge — Claude-Skills und kleine Apps, die genau ein Problem gut lösen.";

export const metadata: Metadata = pageMetadata({
  title: `${category.title} — neckarshore.ai`,
  description,
  path: category.href,
});

export default function SkillsPage() {
  return <SubPortal category={category} description={description} />;
}
