import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/documents/service";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";

    const role = (user?.role || searchParams.get("role") || "CUSTOMER") as any;
    const userId = user?.id || searchParams.get("userId") || undefined;
    const name = user?.name || searchParams.get("name") || undefined;
    const phone = user?.phone || searchParams.get("phone") || undefined;
    const email = user?.email || searchParams.get("email") || undefined;
    const businessName = user?.businessName || searchParams.get("businessName") || undefined;

    const docs = DocumentService.listDocuments(
      { role, userId, name, phone, email, businessName },
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
