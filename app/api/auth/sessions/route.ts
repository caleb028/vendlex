import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, token, isAuthenticated } = getServerSession(req);
  if (!isAuthenticated || !user || !token) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const sessions = serverDB.getUserSessions(user.id).map((s) => ({
    isCurrent: s.token === token,
    createdAt: s.createdAt,
    lastActivityAt: s.lastActivityAt || s.createdAt,
    expiresAt: new Date(s.expiresAt).toISOString(),
    userAgent: s.userAgent || "Unknown device",
    ipAddress: s.ipAddress ? s.ipAddress.replace(/\d+$/, "***") : undefined,
    rememberMe: s.rememberMe || false,
    id: s.token.slice(0, 8),
  }));

  return NextResponse.json({ success: true, sessions });
}

export async function DELETE(req: NextRequest) {
  const { user, token, isAuthenticated } = getServerSession(req);
  if (!isAuthenticated || !user || !token) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");
  const sessionId = searchParams.get("id");

  if (all === "true") {
    serverDB.deleteAllUserSessions(user.id, token);
    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "ALL_SESSIONS_REVOKED",
      resource: "AUTH",
      details: `All other sessions revoked for ${user.email}`,
      status: "SUCCESS",
    });
    return NextResponse.json({ success: true, message: "All other sessions revoked." });
  }

  if (sessionId) {
    // Find the full token by prefix match
    const sessions = serverDB.getUserSessions(user.id);
    const target = sessions.find((s) => s.token.startsWith(sessionId));
    if (!target) {
      return NextResponse.json({ success: false, error: "Session not found." }, { status: 404 });
    }
    if (target.token === token) {
      return NextResponse.json({ success: false, error: "Cannot revoke current session. Use logout instead." }, { status: 400 });
    }
    serverDB.deleteSession(target.token);
    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "SESSION_REVOKED",
      resource: "AUTH",
      details: `Session revoked for ${user.email}`,
      status: "SUCCESS",
    });
    return NextResponse.json({ success: true, message: "Session revoked." });
  }

  return NextResponse.json({ success: false, error: "Specify ?all=true or ?id=<sessionId>" }, { status: 400 });
}
