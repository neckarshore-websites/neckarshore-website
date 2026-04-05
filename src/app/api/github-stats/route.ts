import { NextResponse } from "next/server";
import { getGitHubStats } from "@/lib/github-stats";

export const revalidate = 86400; // cache for 24h

export async function GET() {
  const stats = await getGitHubStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
