import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { serverDB } from "@/lib/server-db";
import { GoogleAdapter } from "@/lib/marketing/adapters/google";
import { MetaAdapter } from "@/lib/marketing/adapters/meta";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("eventType") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    const events = serverDB.getMarketingEvents({ eventType, limit });
    return NextResponse.json({ success: true, events });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch event ledger." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const eventId = body.eventId;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "eventId is required for retry." }, { status: 400 });
    }

    const event = serverDB.findMarketingEventByEventId(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    // Trigger retry to Google & Meta
    const gRes = await GoogleAdapter.sendConversion(event);
    serverDB.updateMarketingEventDelivery(event.id, "GOOGLE", {
      status: gRes.success ? "DELIVERED" : gRes.skipped ? "SKIPPED_UNCONFIGURED" : "FAILED",
      responseId: gRes.responseId,
      error: gRes.error,
    });

    const mRes = await MetaAdapter.sendConversion(event);
    serverDB.updateMarketingEventDelivery(event.id, "META", {
      status: mRes.success ? "DELIVERED" : mRes.skipped ? "SKIPPED_UNCONFIGURED" : "FAILED",
      responseId: mRes.responseId,
      error: mRes.error,
    });

    return NextResponse.json({
      success: true,
      message: "Event re-dispatched to provider destinations.",
      event: serverDB.findMarketingEventByEventId(eventId),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Retry failed." }, { status: 500 });
  }
}
