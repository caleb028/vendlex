import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { VendLexMarketingEngine } from "@/lib/marketing/engine";
import { serverDB } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized access to Admin Marketing Hub." }, { status: 403 });
    }

    const summary = VendLexMarketingEngine.getAnalyticsSummary();
    const connections = serverDB.getAdvertisingConnections();
    const feedSync = serverDB.getProductFeedSync();
    const campaigns = serverDB.getCampaigns({ limit: 5 } as any);
    const recentEvents = serverDB.getMarketingEvents({ limit: 10 });

    return NextResponse.json({
      success: true,
      summary,
      connections,
      feedSync,
      recentCampaigns: campaigns,
      recentEvents,
    });
  } catch (err: any) {
    console.error("[Admin Marketing API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch marketing overview." }, { status: 500 });
  }
}
