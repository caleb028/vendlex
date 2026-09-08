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

    const googleStatus = GoogleAdapter.getConnectionStatus();
    const metaStatus = MetaAdapter.getConnectionStatus();

    // Sync database connection records with environment state
    const googleConn = serverDB.updateAdvertisingConnection("GOOGLE", {
      status: googleStatus.status,
      accountId: googleStatus.accountId,
      merchantCenterId: googleStatus.merchantCenterId,
      lastError: googleStatus.status !== "CONNECTED" ? googleStatus.details : undefined,
    });

    const metaConn = serverDB.updateAdvertisingConnection("META", {
      status: metaStatus.status,
      pixelId: metaStatus.pixelId,
      catalogId: metaStatus.catalogId,
      lastError: metaStatus.status !== "CONNECTED" ? metaStatus.details : undefined,
    });

    return NextResponse.json({
      success: true,
      connections: [googleConn, metaConn],
      diagnostics: {
        google: googleStatus,
        meta: metaStatus,
      },
    });
  } catch (err: any) {
    console.error("[Admin Integrations API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch integrations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const provider = body.provider as "GOOGLE" | "META";
    if (!provider || (provider !== "GOOGLE" && provider !== "META")) {
      return NextResponse.json({ success: false, error: "Invalid provider specified." }, { status: 400 });
    }

    const updated = serverDB.updateAdvertisingConnection(provider, {
      config: body.config,
      updatedAt: new Date().toISOString(),
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "MARKETING_INTEGRATION_UPDATED",
      resource: "MARKETING",
      details: `Updated ${provider} advertising connection settings.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `${provider} configuration updated successfully.`,
      connection: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update integration." }, { status: 500 });
  }
}
