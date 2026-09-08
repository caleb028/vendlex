import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { ServerUser, UserRole } from "@/lib/server-db/types";

export const SESSION_COOKIE_NAME = "vendlex_session";

export interface AuthSessionResult {
  user: ServerUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Extract authenticated user session from NextRequest (Cookie or Bearer header)
 */
export function getServerSession(req: NextRequest): AuthSessionResult {
  let token: string | undefined = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return { user: null, token: null, isAuthenticated: false };
  }

  const session = serverDB.getSession(token);
  if (!session) {
    return { user: null, token: null, isAuthenticated: false };
  }

  const user = serverDB.findUserById(session.userId);
  if (!user) {
    return { user: null, token: null, isAuthenticated: false };
  }

  // Reject sessions for suspended/disabled accounts
  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    serverDB.deleteSession(token);
    return { user: null, token: null, isAuthenticated: false };
  }

  return { user, token, isAuthenticated: true };
}

/**
 * Enforce that request has valid authenticated session
 */
export function requireAuth(req: NextRequest): { user: ServerUser; token: string } | NextResponse {
  const { user, token, isAuthenticated } = getServerSession(req);
  if (!isAuthenticated || !user || !token) {
    return NextResponse.json(
      { success: false, error: "Authentication required. Please sign in." },
      { status: 401 }
    );
  }
  return { user, token };
}

/**
 * Enforce specific user roles for sensitive endpoints
 */
export function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): { user: ServerUser; token: string } | NextResponse {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!allowedRoles.includes(auth.user.role)) {
    serverDB.logAction({
      userId: auth.user.id,
      userRole: auth.user.role,
      action: "UNAUTHORIZED_ROLE_ACCESS_ATTEMPT",
      resource: req.nextUrl.pathname,
      details: `User with role ${auth.user.role} attempted to access role-restricted endpoint ${req.nextUrl.pathname}`,
      status: "DENIED",
    });

    return NextResponse.json(
      { success: false, error: `Forbidden: Requires one of [${allowedRoles.join(", ")}]` },
      { status: 403 }
    );
  }

  return auth;
}
