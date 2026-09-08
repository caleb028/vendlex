import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security";

const SESSION_COOKIE = "vendlex_session";

// Routes that require authentication (redirects to login if no cookie)
const AUTH_REQUIRED_PREFIXES = [
  "/seller",
  "/admin",
  "/account",
  "/checkout",
];

// Routes restricted to specific roles
const ROLE_RESTRICTIONS: Record<string, string[]> = {
  "/admin": ["ADMIN", "SUPER_ADMIN"],
  "/seller": ["SELLER", "BUSINESS_OWNER", "ADMIN", "SUPER_ADMIN"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  // 1. Rate Limiting on API endpoints
  if (pathname.startsWith("/api/")) {
    const rateKey = `ip:${ip}:${pathname}`;
    const limit = pathname.includes("stkpush") ? 15 : 60;
    const { allowed, remaining, resetTime } = checkRateLimit(rateKey, limit, 60000);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // 2. Authentication enforcement for protected routes
  const needsAuth = AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (needsAuth) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Note: Full session validation and role checks happen server-side in the page/API via requireAuth().
    // The middleware only checks for cookie presence to redirect unauthenticated users quickly.
    // This avoids the Edge Runtime limitation of not being able to call Node.js crypto for DB lookups.
  }

  // 3. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/seller/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
};
