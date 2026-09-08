import { NextRequest, NextResponse } from "next/server";
import { VendLexMarketingEngine } from "@/lib/marketing/engine";
import { checkRateLimit } from "@/lib/security";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Rate limit: 60 events per minute per IP
    const rate = checkRateLimit(`mkt_events:${ip}`, 60, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded." },
        { status: 429 }
      );
    }

    const { user } = getServerSession(req);
    const body = await req.json().catch(() => ({}));

    if (!body.eventType) {
      return NextResponse.json(
        { success: false, error: "Missing eventType." },
        { status: 400 }
      );
    }

    // Critical security check: Never allow client to trigger a purchase conversion directly
    if (body.eventType === "purchase") {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase events must be triggered via authoritative backend payment verification.",
        },
        { status: 403 }
      );
    }

    const event = await VendLexMarketingEngine.trackEvent({
      ...body,
      userId: user?.id || body.userId,
      userRole: user?.role,
      userEmail: user?.email,
      requestMeta: {
        ipAddress: ip,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.eventId,
      status: "RECORDED",
    });
  } catch (err: any) {
    console.error("[Marketing Events API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record event." },
      { status: 500 }
    );
  }
}
