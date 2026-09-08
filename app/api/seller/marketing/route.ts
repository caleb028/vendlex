import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { serverDB } from "@/lib/server-db";
import { VendLexMarketingEngine } from "@/lib/marketing/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized access to Seller Marketing." }, { status: 403 });
    }

    const sellerId = user.businessId || user.id;

    // Strict seller data isolation
    const summary = VendLexMarketingEngine.getAnalyticsSummary({ sellerId });
    const campaigns = serverDB.getCampaigns({ sellerId });
    const sellerProducts = serverDB.getProducts().filter((p) => p.businessId === sellerId || (p as any).sellerId === sellerId);

    return NextResponse.json({
      success: true,
      summary,
      campaigns,
      products: sellerProducts.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.images && p.images.length > 0 ? p.images[0] : "",
        stockCount: p.stockCount,
        category: p.category,
        isPromoted: campaigns.some((c) => c.productId === p.id && c.status === "ACTIVE"),
      })),
    });
  } catch (err: any) {
    console.error("[Seller Marketing API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch seller marketing overview." }, { status: 500 });
  }
}
