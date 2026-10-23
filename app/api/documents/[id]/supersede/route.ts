import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireRole(req, ["SELLER", "BUSINESS_OWNER", "ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { id } = await context.params;
    const body = await req.json();
    const { newData = {} } = body;

    const res = DocumentService.supersedeDocument(id, newData, {
      role: user.role,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessName: user.businessName,
    });

    if (!res.success || !res.newDoc) {
      return NextResponse.json({ success: false, error: res.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: `Document '${id}' superseded by Version ${res.newDoc.version} (${res.newDoc.publicDocumentId}).`,
      newDocument: res.newDoc,
    });
  } catch (error: any) {
    console.error("[Documents Supersede Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to supersede document." },
      { status: 500 }
    );
  }
}
