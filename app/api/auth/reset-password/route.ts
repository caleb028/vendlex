import { NextRequest, NextResponse } from "next/server";
import { serverDB, hashPassword, hashToken } from "@/lib/server-db";
import { checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`reset:${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawToken = (body.token || "").trim();
    const newPassword = body.password || "";

    if (!rawToken) {
      return NextResponse.json({ success: false, error: "Reset token is required." }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const hashedToken = hashToken(rawToken);

    // Find user with matching token
    const users = serverDB.getUsers();
    const user = users.find(
      (u) => u.passwordResetToken === hashedToken && u.passwordResetExpiry && Date.now() < u.passwordResetExpiry
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token. Please request a new password reset." },
        { status: 400 }
      );
    }

    // Hash new password
    const { hash, salt } = hashPassword(newPassword);

    // Update user: new password, clear token, reset attempts
    serverDB.updateUser(user.id, {
      passwordHash: hash,
      salt,
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
      loginAttempts: 0,
      lockedUntil: undefined,
    });

    // Revoke all sessions
    serverDB.deleteAllUserSessions(user.id);

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "PASSWORD_RESET_COMPLETED",
      resource: "AUTH",
      ipAddress: ip,
      details: `Password successfully reset for ${user.email}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. Please sign in with your new password.",
    });
  } catch (err: any) {
    console.error("[Auth Reset Password Error]:", err?.message);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
