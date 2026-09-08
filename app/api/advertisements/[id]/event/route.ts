import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

    // Rate-limit per IP + ad to prevent event spam (e.g., 60 events/min per IP/ad)
    const rateCheck = checkRateLimit(`ad-event:${ip}:${id}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: true, rateLimited: true });
    }

    const body = await req.json().catch(() => ({}));
    const eventType = body.eventType || "impression";

    if (!["impression", "view", "click"].includes(eventType)) {
      return NextResponse.json({ success: false, error: "Invalid event type." }, { status: 400 });
    }

    const result = serverDB.recordAdvertisementEvent(id, eventType);

    return NextResponse.json({
      success: result.success,
      viewsCount: result.viewsCount,
      clicksCount: result.clicksCount,
    });
  } catch (err: any) {
    console.error("[Advertisement Event error]:", err?.message);
    return NextResponse.json({ success: false, error: "Failed to record event." }, { status: 500 });
  }
}
