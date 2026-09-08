import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const sessionId = req.cookies.get("vlx_session_id")?.value || "";

    const consent =
      (user?.id ? serverDB.getConsent(user.id) : undefined) ||
      (sessionId ? serverDB.getConsent(sessionId) : undefined) || {
        essential: true,
        analytics: true,
        marketing: true,
        updatedAt: new Date().toISOString(),
      };

    return NextResponse.json({ success: true, consent });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to read consent." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const body = await req.json().catch(() => ({}));
    const sessionId = req.cookies.get("vlx_session_id")?.value || body.sessionId || `sess_${Date.now()}`;

    const consent = {
      essential: true as const,
      analytics: body.analytics !== false,
      marketing: body.marketing !== false,
      updatedAt: new Date().toISOString(),
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local",
      userAgent: req.headers.get("user-agent") || undefined,
    };

    if (user?.id) {
      serverDB.setConsent(user.id, consent);
    }
    serverDB.setConsent(sessionId, consent);

    const res = NextResponse.json({ success: true, consent });
    res.cookies.set("vlx_consent", JSON.stringify(consent), {
      path: "/",
      maxAge: 365 * 24 * 3600,
      sameSite: "lax",
    });

    return res;
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update consent." }, { status: 500 });
  }
}
