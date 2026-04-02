import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/analytics-store";

const VALID_EVENTS = new Set(["page_view", "cta_click", "scroll_depth"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.event || !VALID_EVENTS.has(body.event)) {
      return NextResponse.json({ error: "invalid event" }, { status: 400 });
    }

    const event = {
      event: body.event,
      page: body.page || "/",
      referrer: body.referrer || null,
      device: body.device || "unknown",
      depth: body.depth || null,
      action: body.action || null,
      timestamp: body.timestamp || new Date().toISOString(),
      source: body.source === "playwright" ? "playwright" : "browser",
    };

    const day = event.timestamp.slice(0, 10);
    await store.push(`events:${day}`, JSON.stringify(event));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const days = Math.min(parseInt(searchParams.get("days") || "1", 10), 90);

  const includeTest = searchParams.get("include_test") === "true";
  const results: Record<string, unknown[]> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(day);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const raw = await store.list(`events:${key}`);
    const events = raw.map((r) => JSON.parse(r));
    const filtered = includeTest
      ? events
      : events.filter((e: Record<string, unknown>) => e.source !== "playwright");
    if (filtered.length > 0) {
      results[key] = filtered;
    }
  }

  const totalEvents = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  const pageViews = Object.values(results)
    .flat()
    .filter((e: unknown) => (e as Record<string, unknown>).event === "page_view").length;

  return NextResponse.json({
    totalEvents,
    pageViews,
    days: Object.keys(results).length,
    data: results,
  });
}
