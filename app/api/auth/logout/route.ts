import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { token, user } = getServerSession(req);

  if (token) {
    serverDB.deleteSession(token);
    if (user) {
      serverDB.logAction({
        userId: user.id,
        userRole: user.role,
        action: "USER_LOGGED_OUT",
        resource: "AUTH",
        details: `User ${user.name} logged out`,
        status: "SUCCESS",
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  // Clear cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
