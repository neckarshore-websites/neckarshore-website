import { NextRequest, NextResponse } from "next/server";

const VALID_EVENTS = new Set(["page_view", "cta_click", "scroll_depth"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.event || !VALID_EVENTS.has(body.event)) {
      return NextResponse.json({ error: "invalid event" }, { status: 400 });
    }

    // Log to stdout for now — Vercel captures this in log drain
    // Replace with Vercel KV or PostgreSQL later
    console.log(
      JSON.stringify({
        type: "analytics",
        event: body.event,
        page: body.page || "/",
        referrer: body.referrer || null,
        device: body.device || "unknown",
        depth: body.depth || null,
        action: body.action || null,
        timestamp: body.timestamp || new Date().toISOString(),
      })
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
