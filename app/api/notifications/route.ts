import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    const userId = user?.id || req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const notifs = serverDB.getUserNotifications(userId);
    return NextResponse.json({ success: true, notifications: notifs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;
    if (id) {
      serverDB.markNotificationAsRead(id);
      return NextResponse.json({ success: true, message: "Marked as read." });
    }
    return NextResponse.json({ success: false, error: "Missing notification id." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to update notification." }, { status: 500 });
  }
}
