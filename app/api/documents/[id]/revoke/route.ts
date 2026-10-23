import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";
import { requireRole } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { id } = await context.params;
    const body = await req.json();
    const reason = sanitizeInput(body.reason || "", 300);

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "A revocation reason is required." },
        { status: 400 }
      );
    }

    const res = DocumentService.revokeDocument(id, reason, {
      role: user.role,
      userId: user.id,
      name: user.name,
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
