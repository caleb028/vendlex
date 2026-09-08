import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = serverDB.getAdvertisements({
      status: status as any,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      advertisements: result.advertisements,
      total: result.total,
    });
  } catch (err: any) {
    console.error("[Admin Advertisements GET error]:", err?.message);
    return NextResponse.json({ success: false, error: "Failed to fetch advertisements." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id;
    const action = body.action; // "approve" | "reject" | "suspend"
    const note = body.note ? sanitizeInput(body.note, 300) : undefined;
    const reason = body.reason ? sanitizeInput(body.reason, 300) : undefined;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: "Advertisement ID and action are required." }, { status: 400 });
    }

    let updatedAd = null;

    if (action === "approve") {
      updatedAd = serverDB.approveAdvertisement(id, note || "Approved by Compliance Admin");
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json({ success: false, error: "A rejection reason is required." }, { status: 400 });
      }
      updatedAd = serverDB.rejectAdvertisement(id, reason);
    } else if (action === "suspend") {
      updatedAd = serverDB.suspendAdvertisement(id, note || "Suspended by Admin");
    } else {
      return NextResponse.json({ success: false, error: "Invalid action. Allowed: approve, reject, suspend." }, { status: 400 });
    }

    if (!updatedAd) {
      return NextResponse.json({ success: false, error: "Advertisement not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Advertisement ${action}d successfully.`,
      advertisement: updatedAd,
    });
  } catch (err: any) {
    console.error("[Admin Advertisements PATCH error]:", err?.message);
    return NextResponse.json({ success: false, error: "Failed to update advertisement." }, { status: 500 });
  }
}
