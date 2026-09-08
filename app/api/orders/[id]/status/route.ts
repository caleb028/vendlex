import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput } from "@/lib/security";

export const dynamic = "force-dynamic";

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

    // Check permission: only owning seller or admin can update order status
    const isSellerOwner =
      order.sellerId === user.businessId ||
      order.sellerId === user.businessSlug ||
      (user.businessName && order.sellerName.toLowerCase() === user.businessName.toLowerCase());
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isSellerOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to update this order." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newStatus = body.status;
    const courierTracking = body.courierTracking ? sanitizeInput(body.courierTracking, 50) : undefined;
    const mpesaReceipt = body.mpesaReceipt ? sanitizeInput(body.mpesaReceipt, 50) : undefined;

    const res = serverDB.updateOrderStatus(id, newStatus, {
      courierTracking,
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
