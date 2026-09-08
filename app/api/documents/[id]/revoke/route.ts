import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { reason, adminName = "Compliance Admin", role = "ADMIN" } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "A revocation reason is required." },
        { status: 400 }
      );
    }

    const res = DocumentService.revokeDocument(id, reason.trim(), {
      role,
      name: adminName,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: `Document '${id}' revoked successfully.`,
    });
  } catch (error: any) {
    console.error("[Documents Revoke Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke document." },
      { status: 500 }
    );
  }
}
