import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { serverDB } from "@/lib/server-db";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const sellerId = user.businessId || user.id;
    const campaigns = serverDB.getCampaigns({ sellerId });
    return NextResponse.json({ success: true, campaigns });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch seller campaigns." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const sellerId = user.businessId || user.id;
    const body = await req.json();

    const name = sanitizeInput(body.name || "", 100);
    const platform = body.platform === "META" ? "META" : body.platform === "CROSS_PLATFORM" ? "CROSS_PLATFORM" : "GOOGLE";
    const objective = body.objective || "SALES";
    const budgetAmount = Number(body.budgetAmount);
    const dailyBudget = body.dailyBudget ? Number(body.dailyBudget) : Math.round(budgetAmount / 30);
    const productId = body.productId ? sanitizeInput(body.productId, 50) : undefined;
    const targetCounties = Array.isArray(body.targetCounties) && body.targetCounties.length > 0
      ? body.targetCounties.map((c: string) => sanitizeInput(c, 50))
      : ["Nairobi", "Kiambu", "Nakuru", "Mombasa"];

    if (!name || isNaN(budgetAmount) || budgetAmount < 500) {
      return NextResponse.json(
        { success: false, error: "Campaign name and a minimum budget of KSh 500 are required." },
        { status: 400 }
      );
    }

    // Verify product ownership if productId provided
    let productTitle: string | undefined;
    let productImage: string | undefined;
    if (productId) {
      const prod = serverDB.getProductById(productId);
      if (!prod) {
        return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
      }
      if (prod.businessId !== sellerId && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized: You can only promote your own products." }, { status: 403 });
      }
      productTitle = prod.title;
      productImage = prod.images && prod.images.length > 0 ? prod.images[0] : undefined;
    }

    const campaign = serverDB.createCampaign({
      name,
      platform,
      objective,
      sellerId,
      sellerName: user.businessName || user.name,
      productId,
      productTitle,
      productImage,
      targetCounties,
      budgetAmount,
      dailyBudget,
      currency: "KES",
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate,
      status: "READY_FOR_SUBMISSION", // Explicit status prevents automatic charging
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "SELLER_CAMPAIGN_CREATED",
      resource: "MARKETING_CAMPAIGN",
      resourceId: campaign.id,
      details: `Seller ${user.name} configured campaign "${campaign.name}" for KSh ${campaign.budgetAmount.toLocaleString()}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Campaign configured and saved as Ready for Submission. You will be prompted before launch.",
      campaign,
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Seller Campaign Create Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to create campaign." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const sellerId = user.businessId || user.id;
    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ success: false, error: "Campaign ID required." }, { status: 400 });
    }

    const existing = serverDB.getCampaignById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Campaign not found." }, { status: 404 });
    }

    // IDOR security check
    if (existing.sellerId !== sellerId && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: You can only modify your own campaigns." }, { status: 403 });
    }

    // Allow seller to change status to PAUSED or ACTIVE
    const allowedUpdates: Record<string, any> = {};
    if (body.status && ["ACTIVE", "PAUSED", "DRAFT"].includes(body.status)) {
      allowedUpdates.status = body.status;
    }
    if (body.name) allowedUpdates.name = sanitizeInput(body.name, 100);
    if (body.targetCounties && Array.isArray(body.targetCounties)) {
      allowedUpdates.targetCounties = body.targetCounties;
    }

    const updated = serverDB.updateCampaign(id, allowedUpdates);

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "SELLER_CAMPAIGN_UPDATED",
      resource: "MARKETING_CAMPAIGN",
      resourceId: id,
      details: `Seller ${user.name} updated campaign ${id} status to ${updated?.status}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update campaign." }, { status: 500 });
  }
}
