import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { sanitizeInput, isValidKenyanPhone } from "@/lib/security";
import { calculateCountyDeliveryFee } from "@/lib/delivery";

export const dynamic = "force-dynamic";

// In-memory idempotency cache to prevent double-charging or duplicate orders
const idempotencyStore = new Map<string, { timestamp: number; order: any }>();

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    let orders = serverDB.getOrders();

    if (isAuthenticated && user) {
      if (user.role === "SELLER" || user.role === "BUSINESS_OWNER") {
        const sId = user.businessId || user.businessSlug || user.id;
        orders = serverDB.getSellerOrders(sId);
      } else if (user.role === "CUSTOMER") {
        orders = serverDB.getCustomerOrders(user.id);
      }
      // ADMIN sees all orders
    } else if (sellerId) {
      orders = serverDB.getSellerOrders(sellerId);
    }

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("x-idempotency-key") || "";
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      const existing = idempotencyStore.get(idempotencyKey)!;
      return NextResponse.json({
        success: true,
        order: existing.order,
        isDuplicatePrevented: true,
      });
    }

    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, error: "Please sign in or create an account to place your order." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const customerName = sanitizeInput(body.customerName || user.name || "Customer", 80);
    const customerPhone = sanitizeInput(body.customerPhone || user.phone || "", 20);
    const customerEmail = sanitizeInput(body.customerEmail || user.email || "", 100);
    const county = sanitizeInput(body.county || "Nairobi", 50);
    const town = sanitizeInput(body.town || "Central", 50);
    const estate = sanitizeInput(body.estate || "Estate", 100);
    const deliveryNotes = body.deliveryNotes ? sanitizeInput(body.deliveryNotes, 200) : undefined;
    const paymentMethod = body.paymentMethod === "CARD" ? "CARD" : body.paymentMethod === "COD" ? "COD" : "MPESA";
    const promoCode = (body.promoCode || "").trim().toUpperCase();

    if (!isValidKenyanPhone(customerPhone)) {
      return NextResponse.json(
        { success: false, error: "A valid Kenyan mobile number is required for delivery coordination." },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cannot create an order with an empty cart." }, { status: 400 });
    }

    // Authoritative server-side price & stock verification
    const orderItems: any[] = [];
    let subtotal = 0;
    let primarySellerId = "biz-1";
    let primarySellerName = "VendLex Marketplace";

    for (const item of rawItems) {
      const product = serverDB.getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, error: `Product ID ${item.productId} is invalid or expired.` }, { status: 400 });
      }

      const qty = Math.max(1, Math.min(item.quantity || 1, 50));
      if (product.stockCount < qty) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for "${product.title}". Only ${product.stockCount} remaining.`,
        }, { status: 400 });
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      primarySellerId = product.businessId;
      primarySellerName = product.businessName;

      orderItems.push({
        productId: product.id,
        productTitle: product.title,
        sku: product.sku,
        quantity: qty,
        unitPrice: product.price,
        totalPrice: itemTotal,
        sellerId: product.businessId,
        sellerName: product.businessName,
        image: product.images[0] || "",
      });

      // Decrement inventory in live database
      serverDB.decrementStock(product.id, qty);
    }

    const deliveryFee = calculateCountyDeliveryFee(county);
    let discountAmount = 0;
    if (promoCode === "KARIBU10" || promoCode === "SOKO10") {
      discountAmount = Math.round(subtotal * 0.1);
    }
    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = serverDB.createOrder({
      orderNumber,
      customerId: user?.id || `guest-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail,
      county,
      town,
      estate,
      deliveryNotes,
      items: orderItems,
      sellerId: primarySellerId,
      sellerName: primarySellerName,
      subtotal,
      deliveryFee,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "UNPAID",
      status: "PENDING_PAYMENT",
      courierTracking: `VLX-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      attribution: body.attribution || undefined,
    });

    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, { timestamp: Date.now(), order: newOrder });
    }

    // In-app notification for buyer
    if (user?.id) {
      serverDB.addNotification({
        userId: user.id,
        title: `Order ${newOrder.orderNumber} Created`,
        message: `Your order for ${orderItems.length} item(s) has been placed. Amount: KSh ${newOrder.totalAmount.toLocaleString()}.`,
        type: "ORDER",
        link: `/customer/dashboard`,
      });
    }

    serverDB.logAction({
      userId: user?.id,
      userRole: user?.role,
      action: "ORDER_CREATED",
      resource: "ORDER",
      resourceId: newOrder.id,
      details: `Created order ${newOrder.orderNumber} totaling KSh ${newOrder.totalAmount}`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Order Create Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to process order." }, { status: 500 });
  }
}
