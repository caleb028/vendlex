import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverDB, hashToken } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security";
import { sendEmailVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`resend-verify:${ip}`, 3, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: false, error: "Email is already verified." }, { status: 400 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);

    serverDB.updateUser(user.id, {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Dispatch verification email
    await sendEmailVerificationEmail({
      to: user.email,
      name: user.name,
      token: rawToken,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err: any) {
    console.error("[Auth Resend Verification Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
