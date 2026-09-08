import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";
import { DocumentStore } from "@/lib/documents/store";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user } = getServerSession(req);
    const { searchParams } = new URL(req.url);

    const role = (user?.role || searchParams.get("role") || "CUSTOMER") as any;
    const userId = user?.id || searchParams.get("userId") || undefined;
    const name = user?.name || searchParams.get("name") || undefined;
    const phone = user?.phone || searchParams.get("phone") || undefined;
    const email = user?.email || searchParams.get("email") || undefined;
    const businessName = user?.businessName || searchParams.get("businessName") || undefined;

    const res = DocumentService.getDocument(id, {
      role,
      userId,
      name,
      phone,
      email,
      businessName,
    });

    if (!res.success || !res.document) {
      return NextResponse.json({ success: false, error: res.error }, { status: 404 });
    }

    const auditLogs = DocumentStore.getAuditLogs(res.document.publicDocumentId);

    return NextResponse.json({
      success: true,
      document: res.document,
      auditLogs,
    });
  } catch (error: any) {
    console.error("[Documents API Get Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve document details." },
      { status: 500 }
    );
  }
}
