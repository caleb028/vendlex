import { NextRequest, NextResponse } from "next/server";
import { serverDB, hashPassword, verifyPassword } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Administrator credentials required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const currentPassword = (body.currentPassword || "").trim();
    const newPassword = (body.newPassword || "").trim();
    const confirmPassword = (body.confirmPassword || "").trim();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    const dbUser = serverDB.findUserById(user.id);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Admin account not found in database." },
        { status: 404 }
      );
    }

    // Verify current password with Scrypt
    const isValid = verifyPassword(currentPassword, dbUser.passwordHash, dbUser.salt);
    if (!isValid) {
      serverDB.logAction({
        userId: user.id,
        userRole: user.role,
        action: "ADMIN_PASSWORD_CHANGE_FAILED",
        resource: "AUTH",
        resourceId: user.id,
        details: "Failed attempt to change administrator password (incorrect current password)",
        status: "DENIED",
      });

      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // Hash new password using Scrypt
    const { hash, salt } = hashPassword(newPassword);
    serverDB.updateUser(user.id, {
      passwordHash: hash,
      salt: salt,
      updatedAt: new Date().toISOString(),
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "ADMIN_PASSWORD_CHANGED",
      resource: "AUTH",
      resourceId: user.id,
      details: "Administrator password changed successfully",
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Administrator password updated successfully.",
    });
  } catch (err: any) {
    console.error("[Admin Password Change Error]:", err?.message);
    return NextResponse.json(
      { success: false, error: "Internal server error while changing password." },
      { status: 500 }
    );
  }
}
