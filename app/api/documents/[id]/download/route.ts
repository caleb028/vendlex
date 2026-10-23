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

    const inline = searchParams.get("inline") === "true";
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

    const pdfRes = await DocumentService.generatePDF(id, authCtx, code);

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
