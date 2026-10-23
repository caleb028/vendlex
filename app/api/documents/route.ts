import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to list documents.", count: 0, documents: [] },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";

    const docs = DocumentService.listDocuments(
      {
        role: user.role,
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        businessName: user.businessName,
      },
      { type, status, search }
    );

    return NextResponse.json({
      success: true,
      count: docs.length,
      documents: docs,
    });
  } catch (error: any) {
    console.error("[Documents API List Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve documents." },
      { status: 500 }
    );
  }
}
