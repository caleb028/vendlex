import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverDB, hashToken, normalizeKenyanPhone } from "@/lib/server-db";
import { checkRateLimit } from "@/lib/security";
import { sendPasswordResetEmail, getAppBaseUrl } from "@/lib/email";

export const dynamic = "force-dynamic";

const GENERIC_SUCCESS = "If an account matches those details, you'll receive password reset instructions.";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    
    // In production enforce strict 5/hour rate limit, on local/dev allow 100/hour
    const isDev = process.env.NODE_ENV !== "production" || ip === "local" || ip === "127.0.0.1" || ip === "::1";
    const rateLimitMax = isDev ? 100 : 5;
    const rateCheck = checkRateLimit(`forgot:${ip}`, rateLimitMax, 60 * 60 * 1000);
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many password reset requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const identifier = (body.email || body.identifier || "").trim();

    if (!identifier) {
      return NextResponse.json({ success: false, error: "Email or phone number is required." }, { status: 400 });
    }

    // Try finding user by email or normalized phone
    let user = serverDB.findUserByIdentifier(identifier);
    if (!user && !identifier.includes("@")) {
      const normalized = normalizeKenyanPhone(identifier);
      if (normalized) {
        user = serverDB.findUserByPhone(normalized);
      }
    }

    if (user) {
      // Generate crypto-secure token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashToken(rawToken);

      // Store hashed token with 1h expiry
      serverDB.updateUser(user.id, {
        passwordResetToken: hashedToken,
        passwordResetExpiry: Date.now() + 60 * 60 * 1000,
      });

      serverDB.logAction({
        userId: user.id,
        userRole: user.role,
        action: "PASSWORD_RESET_REQUESTED",
        resource: "AUTH",
        ipAddress: ip,
        details: `Password reset requested for ${user.email}`,
        status: "SUCCESS",
      });

      // Dispatch password reset email via configured transport / spool
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: rawToken,
        ipAddress: ip,
      });

      const baseUrl = getAppBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

      return NextResponse.json({
        success: true,
        message: GENERIC_SUCCESS,
        emailDispatched: true,
        recipient: user.email,
        provider: emailResult.provider,
        devInfo: {
          email: user.email,
          name: user.name,
          token: rawToken,
          resetUrl,
          provider: emailResult.provider,
        },
      });
    }

    // If account was not found in DB
    return NextResponse.json({
      success: true,
      message: GENERIC_SUCCESS,
      emailDispatched: false,
      userFound: false,
      devInfo: {
        notice: "Identifier not found in database.",
        suggestedDemoAccounts: [
          { name: "Grace Wanjiku (Buyer)", email: "grace.wanjiku@gmail.com", phone: "0712 987 654" },
          { name: "Kevin Mwangi (Seller)", email: "kevin@nairobihub.co.ke", phone: "0712 345 678" },
          { name: "Antony Otieno (Admin)", email: "admin@vendlex.co.ke", phone: "0700 000 001" },
        ],
      },
    });
  } catch (err: any) {
    console.error("[Auth Forgot Password Error]:", err?.message);
    return NextResponse.json(
      { success: false, error: "Internal server error during password reset request." },
      { status: 500 }
    );
  }
}
