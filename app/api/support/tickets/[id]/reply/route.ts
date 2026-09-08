import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`reply_ticket:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many messages sent. Please slow down." },
        { status: 429 }
      );
    }

    const { user } = getServerSession(req);
    const body = await req.json();

    const message = sanitizeInput(body.message || "", 2000);
    const senderName = sanitizeInput(body.senderName || user?.name || "Customer", 80);

    if (!message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const ticket = serverDB.findSupportTicketById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Support ticket not found." }, { status: 404 });
    }

    const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
    const senderRole = isAdmin
      ? "ADMIN"
      : user?.role === "SELLER"
      ? "SELLER"
      : "CUSTOMER";

    const updated = serverDB.addSupportTicketMessage(ticket.id, {
      senderId: user?.id,
      senderName: isAdmin ? `${senderName} (Support HQ)` : senderName,
      senderRole,
      message,
    });

    // Notify ticket owner if admin replied
    if (isAdmin && ticket.userId) {
      serverDB.addNotification({
        userId: ticket.userId,
        title: `Reply to Support Ticket ${ticket.ticketNumber}`,
        message: `Support team has replied to: "${ticket.subject}"`,
        type: "SYSTEM",
        link: `/help?ticket=${ticket.ticketNumber}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
      ticket: updated,
    });
  } catch (error: any) {
    console.error("[Support Ticket Reply Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send ticket reply." },
      { status: 500 }
    );
  }
}
