import { NextRequest, NextResponse } from "next/server";
import { serverDB, verifyPassword, normalizeKenyanPhone } from "@/lib/server-db";
import { checkRateLimit } from "@/lib/security";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many sign-in attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const identifier = (body.email || body.identifier || "").trim();
    const password = body.password || "";
    const rememberMe = body.rememberMe === true;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Email/phone and password are required." },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = serverDB.findUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email/phone or password." },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && Date.now() < user.lockedUntil) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { success: false, error: `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.` },
        { status: 423 }
      );
    }

    // Check account status
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { success: false, error: "Your VendLex account is currently suspended. Please contact support." },
        { status: 403 }
      );
    }
    if (user.status === "DISABLED") {
      return NextResponse.json(
        { success: false, error: "This account has been disabled. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      // Increment failed attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const updates: Record<string, any> = { loginAttempts: attempts };
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      }
      serverDB.updateUser(user.id, updates);

      serverDB.logAction({
        userId: user.id,
        userRole: user.role,
        action: "LOGIN_FAILED",
        resource: "AUTH",
        ipAddress: ip,
        details: `Failed password attempt (${attempts}/${MAX_LOGIN_ATTEMPTS})`,
        status: "DENIED",
      });

      return NextResponse.json(
        { success: false, error: "Invalid email/phone or password." },
        { status: 401 }
      );
    }

    // Reset login attempts on success
    if (user.loginAttempts || user.lockedUntil) {
      serverDB.updateUser(user.id, { loginAttempts: 0, lockedUntil: undefined });
    }

    // Create authenticated session with metadata
    const userAgent = req.headers.get("user-agent") || undefined;
    const session = serverDB.createSession(user.id, user.role, {
      rememberMe,
      userAgent,
      ipAddress: ip,
    });

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "LOGIN_SUCCESS",
      resource: "AUTH",
      ipAddress: ip,
      details: `User ${user.name} logged in successfully${rememberMe ? " (remember me)" : ""}`,
      status: "SUCCESS",
    });

    const response = NextResponse.json({
      success: true,
      message: "Sign in successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        businessId: user.businessId,
        businessSlug: user.businessSlug,
        businessName: user.businessName,
        isVerified: user.isVerified,
      },
    });

    const maxAge = rememberMe ? 30 * 24 * 3600 : 72 * 3600;
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (err: any) {
    console.error("[Auth Login Error]:", err?.message);
    return NextResponse.json(
      { success: false, error: "Internal server error during sign in." },
      { status: 500 }
    );
  }
}
