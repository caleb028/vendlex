import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const userId = searchParams.get("userId") || undefined;

    const kycs = serverDB.getKYCs({ status, userId });
    return NextResponse.json({ success: true, kycs });
  } catch (err: any) {
    console.error("[Admin KYC GET Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch KYC submissions." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id;
    const status = body.status;
    const reviewNotes = body.reviewNotes ? sanitizeInput(body.reviewNotes, 200) : undefined;

    if (!id || (status !== "APPROVED" && status !== "REJECTED")) {
      return NextResponse.json({ success: false, error: "Invalid KYC ID or status." }, { status: 400 });
    }

    const updatedKYC = serverDB.updateKYCStatus(id, status, reviewNotes);
    if (!updatedKYC) {
      return NextResponse.json({ success: false, error: "KYC record not found." }, { status: 404 });
    }

    // Send notification to merchant
    if (updatedKYC.userId) {
      serverDB.addNotification({
        userId: updatedKYC.userId,
        title: status === "APPROVED" ? "KYC Verification Approved! ✓" : "KYC Verification Update",
        message: status === "APPROVED"
          ? `Congratulations! ${updatedKYC.bizName} has been officially verified with a Verified Merchant Badge on VendLex.`
          : `Your KYC submission requires revision: ${reviewNotes || "Please re-upload valid registration documents."}`,
        type: "SYSTEM",
        link: "/seller/dashboard",
      });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: status === "APPROVED" ? "KYC_APPROVED" : "KYC_REJECTED",
      resource: "KYC",
      resourceId: id,
      details: `KYC for ${updatedKYC.bizName} was ${status} by admin ${user.name}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, kyc: updatedKYC });
  } catch (err: any) {
    console.error("[Admin KYC PUT Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to update KYC status." }, { status: 500 });
  }
}
