import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import type { ServerOrder } from "@/lib/server-db/types";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

const VALID_ORDER_STATUSES: ReadonlyArray<ServerOrder["status"]> = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const { id } = await context.params;
    const order = serverDB.getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isSellerOwner =
      !isAdmin &&
      (order.sellerId === user.businessId ||
        order.sellerId === user.businessSlug ||
        (!!user.businessName && order.sellerName.toLowerCase() === user.businessName.toLowerCase()));
    const isBuyer = order.customerId === user.id;

    if (!isSellerOwner && !isAdmin && !isBuyer) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to update this order." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const rawStatus = body.status;
    if (typeof rawStatus !== "string" || !VALID_ORDER_STATUSES.includes(rawStatus as ServerOrder["status"])) {
      return NextResponse.json({ success: false, error: "Invalid order status." }, { status: 400 });
    }
    const newStatus = rawStatus as ServerOrder["status"];

    // A buyer may only cancel their own order, and only while it is still unpaid.
    if (isBuyer && !isAdmin && !isSellerOwner) {
      if (newStatus !== "CANCELLED" || order.status !== "PENDING_PAYMENT") {
        return NextResponse.json(
          { success: false, error: "You can only cancel an order that has not been paid yet." },
          { status: 403 }
        );
      }
    }

    // Online payments (M-Pesa / card) are confirmed only by the payment callback or an admin.
    // Merchants may mark PAID themselves solely for Cash-on-Delivery orders.
    if (newStatus === "PAID" && !isAdmin && order.paymentMethod !== "COD") {
      return NextResponse.json(
        { success: false, error: "Online payments are confirmed automatically once M-Pesa/card payment succeeds." },
        { status: 403 }
      );
    }

    const courierTracking = body.courierTracking ? sanitizeInput(body.courierTracking, 50) : undefined;
    // Receipts are only ever recorded from the verified payment callback or by an admin.
    const mpesaReceipt = isAdmin && body.mpesaReceipt ? sanitizeInput(body.mpesaReceipt, 50) : undefined;

    const res = serverDB.updateOrderStatus(id, newStatus, {
      courierTracking: isBuyer && !isAdmin && !isSellerOwner ? undefined : courierTracking,
      mpesaReceipt,
      paymentStatus: newStatus === "PAID" ? "PAID" : undefined,
    });


    if (!res.success || !res.order) {
      return NextResponse.json({ success: false, error: res.error || "Failed to update order status." }, { status: 400 });
    }

    // Add buyer notification on shipment or delivery
    if (newStatus === "DISPATCHED") {
      serverDB.addNotification({
        userId: res.order.customerId,
        title: `Order ${res.order.orderNumber} Dispatched!`,
        message: `Your order has been handed over to courier. Tracking: ${res.order.courierTracking || "Assigned"}`,
        type: "ORDER",
        link: `/customer/dashboard`,
      });
    } else if (newStatus === "DELIVERED") {
      serverDB.addNotification({
        userId: res.order.customerId,
        title: `Order ${res.order.orderNumber} Delivered`,
        message: `Your order has arrived. Please leave a verified review to support your merchant!`,
        type: "ORDER",
        link: `/customer/dashboard`,
      });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
      action: "ORDER_STATUS_UPDATED",
      resource: "ORDER",
      resourceId: id,
      details: `Order ${order.orderNumber} status changed from ${order.status} to ${newStatus} by ${user.name}`,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, order: res.order });
  } catch (err: any) {
    console.error("[Order Status Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to update order status." }, { status: 500 });
  }
}
