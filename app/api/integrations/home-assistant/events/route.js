import { NextResponse } from "next/server";
import { sendHomeAssistantEvent } from "@/lib/homeAssistantEvents";

export const dynamic = "force-dynamic";

function isAuthorized(request) {
  const expected = process.env.HOME_ASSISTANT_INGEST_SECRET;
  if (!expected) {
    return false;
  }

  const received = request.headers.get("x-integration-secret") || "";
  return received === expected;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = (body?.event_type || "").toString().trim();
  if (!eventType) {
    return NextResponse.json({ ok: false, error: "event_type is required" }, { status: 400 });
  }

  const result = await sendHomeAssistantEvent(eventType, body?.payload || {});
  return NextResponse.json({ ok: true, result });
}
