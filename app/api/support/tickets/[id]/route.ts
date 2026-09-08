import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user } = getServerSession(req);

    const ticket = serverDB.findSupportTicketById(id);
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Support ticket not found." }, { status: 404 });
    }

    const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
    // If ticket is tied to a user, non-admins can only view their own
    if (ticket.userId && !isAdmin && user?.id !== ticket.userId) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view this ticket." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    console.error("[Support Ticket Detail GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve ticket details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user } = getServerSession(req);

    const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required to update support tickets." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, priority, assignedTo, resolutionNotes } = body;

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assignedTo !== undefined) updates.assignedTo = sanitizeInput(assignedTo, 80);
    if (resolutionNotes !== undefined) updates.resolutionNotes = sanitizeInput(resolutionNotes, 1000);

    const updated = serverDB.updateSupportTicket(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Support ticket not found." }, { status: 404 });
    }

    // Log admin action
    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "SUPPORT_TICKET_UPDATED",
      resource: "SUPPORT_TICKET",
      resourceId: updated.ticketNumber,
      details: `Ticket ${updated.ticketNumber} updated to status ${updated.status} (priority: ${updated.priority})`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Support ticket ${updated.ticketNumber} updated successfully.`,
      ticket: updated,
    });
  } catch (error: any) {
    console.error("[Support Ticket PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update support ticket." },
      { status: 500 }
    );
  }
}
