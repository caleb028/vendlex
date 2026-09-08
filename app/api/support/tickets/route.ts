import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "ALL";
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || "";
    const ticketNumber = searchParams.get("ticketNumber");

    // Direct lookup by ticket number (allows guest tracking)
    if (ticketNumber) {
      const ticket = serverDB.findSupportTicketById(ticketNumber);
      if (!ticket) {
        return NextResponse.json({ success: false, error: "Support ticket not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, ticket });
    }

    // Role-based filtering: Admin sees all, User sees own
    const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
    const userIdFilter = isAdmin ? undefined : user?.id;

    const tickets = serverDB.getSupportTickets({
      status,
      category,
      userId: userIdFilter,
      search,
    });

    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    console.error("[Support Tickets GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve support tickets." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateCheck = checkRateLimit(`support_ticket:${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many support inquiries submitted. Please wait a minute." },
        { status: 429 }
      );
    }

    const { user } = getServerSession(req);
    const body = await req.json();

    const userName = sanitizeInput(body.userName || user?.name || "Customer", 80);
    const userEmail = (body.userEmail || user?.email || "").toLowerCase().trim();
    const userPhone = sanitizeInput(body.userPhone || user?.phone || "+254700000000", 25);
    const category = body.category || "GENERAL_INQUIRY";
    const subject = sanitizeInput(body.subject || "Customer Support Inquiry", 150);
    const description = sanitizeInput(body.description || "", 2000);
    const priority = body.priority || "MEDIUM";
    const orderNumber = body.orderNumber ? sanitizeInput(body.orderNumber, 30) : undefined;

    if (!description.trim()) {
      return NextResponse.json(
        { success: false, error: "Please describe your issue or question in detail." },
        { status: 400 }
      );
    }

    const ticket = serverDB.createSupportTicket({
      userId: user?.id,
      userName,
      userEmail: userEmail || "support-request@vendlex.ke",
      userPhone,
      userRole: (user?.role as any) || "GUEST",
      category,
      subject,
      description,
      priority,
      orderNumber,
    });

    // Create system notification if user is logged in
    if (user?.id) {
      serverDB.addNotification({
        userId: user.id,
        title: `Support Ticket Received: ${ticket.ticketNumber}`,
        message: `Your inquiry "${ticket.subject}" has been received. Our Kenya support team is reviewing it.`,
        type: "SYSTEM",
        link: `/help?ticket=${ticket.ticketNumber}`,
      });
    }

    // Always notify administrator (Caleb)
    serverDB.addNotification({
      userId: "usr-admin-1",
      title: `🚨 New Support Ticket: ${ticket.ticketNumber}`,
      message: `From ${userName} (${userPhone} / ${userEmail}): "${ticket.subject}"`,
      type: "SECURITY",
      link: `/admin`,
    });

    return NextResponse.json({
      success: true,
      message: `Support ticket ${ticket.ticketNumber} submitted successfully. Our team will get back to you shortly.`,
      ticket,
    });
  } catch (error: any) {
    console.error("[Support Ticket POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit support ticket." },
      { status: 500 }
    );
  }
}
