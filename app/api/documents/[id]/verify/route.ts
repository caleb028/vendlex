import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const verification = DocumentService.verifyDocument(id);

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error: any) {
    console.error("[Documents Verification API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed." },
      { status: 500 }
    );
  }
}
