import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, token, isAuthenticated } = getServerSession(req);

  if (!isAuthenticated || !user) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
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
}
