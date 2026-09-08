import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { serverDB, normalizeKenyanPhone, hashToken } from "@/lib/server-db";
import { sanitizeInput, isValidKenyanPhone, checkRateLimit } from "@/lib/security";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { sendEmailVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const name = sanitizeInput(body.name || "", 80);
    const email = (body.email || "").toLowerCase().trim();
    const phone = sanitizeInput(body.phone || "", 20);
    const password = body.password || "";
    const role = body.role || "CUSTOMER";
    const businessName = body.businessName ? sanitizeInput(body.businessName, 100) : undefined;

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, error: "Legal name must be at least 2 characters." }, { status: 400 });
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }

    if (!phone || !isValidKenyanPhone(phone)) {
      return NextResponse.json(
        { success: false, error: "A valid Kenyan phone number is required (07XX XXX XXX or 2547...)." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Check duplicate email
    if (serverDB.findUserByEmail(email)) {
      return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
    }

    // Check duplicate phone (normalized)
    const normalizedPhone = normalizeKenyanPhone(phone);
    if (normalizedPhone && serverDB.findUserByPhone(normalizedPhone)) {
      return NextResponse.json({ success: false, error: "An account with this phone number already exists." }, { status: 409 });
    }

    // Create user in server database
    const newUser = serverDB.createUser({
      name,
      email,
      phone,
      role,
      password,
      businessName,
    });

    // Create session
    const userAgent = req.headers.get("user-agent") || undefined;
    const session = serverDB.createSession(newUser.id, newUser.role, {
      userAgent,
      ipAddress: ip,
    });

    // Generate verification token and dispatch welcome verification email
    const rawVerifyToken = crypto.randomBytes(32).toString("hex");
    serverDB.updateUser(newUser.id, {
      emailVerificationToken: hashToken(rawVerifyToken),
      emailVerificationExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });
    sendEmailVerificationEmail({
      to: newUser.email,
      name: newUser.name,
      token: rawVerifyToken,
    }).catch((e) => console.warn("[Verification Email Dispatch Warning]:", e));

    serverDB.logAction({
      userId: newUser.id,
      userRole: newUser.role,
      action: "USER_REGISTERED",
      resource: "AUTH",
      ipAddress: ip,
      details: `New account created: ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
      status: "SUCCESS",
    });

    // Add authentic welcome notification for the newly registered user
    serverDB.addNotification({
      userId: newUser.id,
      title: "Karibu VendLex Kenya!",
      message: `Welcome ${newUser.name}! Your account is active. Start exploring verified products, sellers, and trusted services across Kenya.`,
      type: "SYSTEM",
      link: newUser.role === "SELLER" || newUser.role === "BUSINESS_OWNER" ? "/seller/dashboard" : "/marketplace",
    });

    const response = NextResponse.json({
      success: true,
      message: "Account registered successfully.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        businessId: newUser.businessId,
        businessSlug: newUser.businessSlug,
        businessName: newUser.businessName,
        isVerified: newUser.isVerified,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 72 * 3600,
    });

    return response;
  } catch (err: any) {
    console.error("[Auth Register Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error during registration." }, { status: 500 });
  }
}
