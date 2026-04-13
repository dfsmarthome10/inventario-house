import { NextResponse } from "next/server";
import { getHomeAssistantConfigStatus } from "@/lib/homeAssistantEvents";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    integration: "home-assistant",
    status: getHomeAssistantConfigStatus(),
  });
}
