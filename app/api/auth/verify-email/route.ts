import { NextRequest, NextResponse } from "next/server";
import { serverDB, hashToken } from "@/lib/server-db";
import { checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`verify:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawToken = (body.token || "").trim();

    if (!rawToken) {
      return NextResponse.json({ success: false, error: "Verification token is required." }, { status: 400 });
    }

    const hashedToken = hashToken(rawToken);
    const users = serverDB.getUsers();
    const user = users.find(
      (u) => u.emailVerificationToken === hashedToken && u.emailVerificationExpiry && Date.now() < u.emailVerificationExpiry
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    serverDB.updateUser(user.id, {
      isVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpiry: undefined,
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "EMAIL_VERIFIED",
      resource: "AUTH",
      ipAddress: ip,
      details: `Email verified for ${user.email}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (err: any) {
    console.error("[Auth Verify Email Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
