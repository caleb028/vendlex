import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { serverDB } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || undefined;
    const status = searchParams.get("status") || undefined;
    const sellerId = searchParams.get("sellerId") || undefined;

    const campaigns = serverDB.getCampaigns({ platform, status, sellerId });
    return NextResponse.json({ success: true, campaigns });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch campaigns." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.budgetAmount || !body.platform) {
      return NextResponse.json({ success: false, error: "Name, platform, and budget are required." }, { status: 400 });
    }

    const campaign = serverDB.createCampaign({
      name: body.name,
      platform: body.platform,
      objective: body.objective || "SALES",
      sellerId: body.sellerId || "PLATFORM",
      sellerName: body.sellerName || "VendLex National Commerce",
      productId: body.productId,
      productTitle: body.productTitle,
      productImage: body.productImage,
      targetCounties: Array.isArray(body.targetCounties) && body.targetCounties.length > 0 ? body.targetCounties : ["Nairobi", "Kiambu", "Mombasa", "Nakuru"],
      budgetAmount: Number(body.budgetAmount),
      dailyBudget: body.dailyBudget ? Number(body.dailyBudget) : undefined,
      currency: "KES",
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate,
      status: body.status || "DRAFT",
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "CAMPAIGN_CREATED",
      resource: "MARKETING_CAMPAIGN",
      resourceId: campaign.id,
      details: `Created campaign "${campaign.name}" with budget KSh ${campaign.budgetAmount.toLocaleString()}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to create campaign." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Campaign ID required." }, { status: 400 });
    }

    const updated = serverDB.updateCampaign(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Campaign not found." }, { status: 404 });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "CAMPAIGN_UPDATED",
      resource: "MARKETING_CAMPAIGN",
      resourceId: body.id,
      details: `Updated campaign ${body.id} status to ${body.status || updated.status}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update campaign." }, { status: 500 });
  }
}
