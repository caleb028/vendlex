import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { ProductFeedEngine } from "@/lib/marketing/feed-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const { items, summary } = ProductFeedEngine.getEligibleFeedItems();

    return NextResponse.json({
      success: true,
      summary,
      items: items.slice(0, 50),
      feedUrls: {
        googleMerchantXml: "/api/marketing/feeds/google.xml",
        metaCatalogCsv: "/api/marketing/feeds/meta.csv",
      },
    });
  } catch (err: any) {
    console.error("[Admin Catalog API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to evaluate catalog feeds." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    // Force catalog re-sync
    const { summary } = ProductFeedEngine.getEligibleFeedItems();

    return NextResponse.json({
      success: true,
      message: "Product catalog re-evaluated and synchronized successfully.",
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Sync failed." }, { status: 500 });
  }
}
