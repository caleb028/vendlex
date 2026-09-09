import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const sellerIdParam = searchParams.get("sellerId") || undefined;

    let disputes = serverDB.getDisputes({ status });

    if (isAuthenticated && user) {
      if (user.role === "SELLER" || user.role === "BUSINESS_OWNER") {
        const sId = user.businessId || user.businessSlug || user.id;
        disputes = serverDB.getDisputes({ sellerId: sId, status });
      } else if (user.role === "CUSTOMER") {
        disputes = serverDB.getDisputes({ customerId: user.id, status });
      }
      // ADMIN sees all
    } else if (sellerIdParam) {
      disputes = serverDB.getDisputes({ sellerId: sellerIdParam, status });
    }

    return NextResponse.json({ success: true, disputes });
  } catch (err: any) {
    console.error("[Disputes GET Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch disputes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = getServerSession(req);
    const body = await req.json();

    const orderNumber = sanitizeInput(body.orderNumber || "", 50);
    const reason = sanitizeInput(body.reason || "General Dispute", 100);
    const description = sanitizeInput(body.description || "", 1000);
    const mpesaReceipt = sanitizeInput(body.mpesaReceipt || "", 50);

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: "Order number is required." }, { status: 400 });
    }

    if (!description || description.length < 10) {
      return NextResponse.json({ success: false, error: "Please provide a detailed description (at least 10 characters)." }, { status: 400 });
    }

    // Try to find matching order in database
    const order = serverDB.getOrderByNumber(orderNumber) || (body.orderId ? serverDB.getOrderById(body.orderId) : undefined);

    const customerId = user?.id || order?.customerId || `usr-cust-${Date.now()}`;
    const customerName = user?.name || order?.customerName || body.customerName || "Customer";
    const customerPhone = user?.phone || order?.customerPhone || body.customerPhone || "";
    const sellerId = order?.sellerId || "biz-1";
    const sellerName = order?.sellerName || "Merchant Store";
    const amount = order?.totalAmount || parseFloat(body.amount) || 0;
    const finalMpesaReceipt = mpesaReceipt || order?.mpesaReceipt || `MPE${Math.floor(100000 + Math.random() * 900000)}`;

    const dispute = serverDB.createDispute({
      orderNumber,
      orderId: order?.id || `ord-ext-${Date.now()}`,
      customerId,
      customerName,
      customerPhone,
      sellerId,
      sellerName,
      amount,
      mpesaReceipt: finalMpesaReceipt,
      reason,
      description,
      status: "PENDING_REVIEW",
    });

    // Notify Customer
    if (user?.id || order?.customerId) {
      serverDB.addNotification({
        userId: customerId,
        title: `Dispute ${dispute.id} Opened`,
        message: `Dispute ticket for ${orderNumber} created. Merchant payouts are frozen in escrow pending mediation.`,
        type: "SYSTEM",
        link: "/customer/disputes",
      });
    }

    // Notify Seller
    if (order?.sellerId) {
      // Find seller user by businessId or sellerId
      const allUsers = serverDB.getUsers();
      const sellerUser = allUsers.find(
        (u) => u.businessId === order.sellerId || u.businessSlug === order.sellerId || u.id === order.sellerId
      );
      if (sellerUser) {
        serverDB.addNotification({
          userId: sellerUser.id,
          title: `Dispute Alert on ${orderNumber}`,
          message: `Customer ${customerName} filed a dispute (${reason}). Escrow payout is held.`,
          type: "ORDER",
          link: "/seller/orders",
        });
      }
    }

    serverDB.logAction({
      userId: user?.id,
      userRole: user?.role,
      action: "DISPUTE_OPENED",
      resource: "DISPUTE",
      resourceId: dispute.id,
      details: `Dispute opened for order ${orderNumber} (${reason}) - escrow frozen.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Dispute ticket opened. Escrow funds frozen.",
      dispute,
    });
  } catch (err: any) {
    console.error("[Disputes POST Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to open dispute ticket." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id;
    const status = body.status; // "RESOLVED" | "REJECTED" | "INVESTIGATING"
    const resolutionNotes = body.resolutionNotes ? sanitizeInput(body.resolutionNotes, 500) : undefined;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Dispute ID and status are required." }, { status: 400 });
    }

    const updated = serverDB.updateDisputeStatus(id, status, resolutionNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Dispute ticket not found." }, { status: 404 });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "DISPUTE_RESOLVED",
      resource: "DISPUTE",
      resourceId: id,
      details: `Dispute ${id} marked as ${status}. Notes: ${resolutionNotes || "None"}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: `Dispute #${id} updated to ${status}.`,
      dispute: updated,
    });
  } catch (err: any) {
    console.error("[Disputes PATCH Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to update dispute." }, { status: 500 });
  }
}
