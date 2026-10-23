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
    const code = searchParams.get("code") || undefined;

    const authCtx = user
      ? {
          role: user.role,
          userId: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          businessName: user.businessName,
        }
      : undefined;

    const res = DocumentService.getDocument(id, authCtx, code);

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
