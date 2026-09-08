import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";
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
    const inline = searchParams.get("inline") === "true";

    const pdfRes = await DocumentService.generatePDF(id, {
      role,
      userId,
      name,
      phone,
      email,
      businessName,
    });

    if (!pdfRes.success || !pdfRes.pdfResult) {
      return NextResponse.json(
        { success: false, error: pdfRes.error || "Could not generate PDF." },
        { status: 403 }
      );
    }

    const disposition = inline ? "inline" : `attachment; filename="${pdfRes.filename}"`;

    return new NextResponse(Buffer.from(pdfRes.pdfResult.pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "X-VendLex-Document-ID": id,
        "X-VendLex-SHA256": pdfRes.pdfResult.fileHash,
      },
    });
  } catch (error: any) {
    console.error("[Documents Download Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to render PDF document." },
      { status: 500 }
    );
  }
}
