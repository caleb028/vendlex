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
    const { newData = {}, performedBy = "Seller Admin", role = "SELLER" } = body;

    const res = DocumentService.supersedeDocument(id, newData, {
      role,
      name: performedBy,
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
