import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100", 10);
    const logs = serverDB.getAuditLogs(limit);

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs." }, { status: 500 });
  }
}
