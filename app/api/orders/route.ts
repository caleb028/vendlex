import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireAuth } from "@/lib/auth/session";
import { sanitizeInput, isValidKenyanPhone } from "@/lib/security";
import { calculateCountyDeliveryFee } from "@/lib/delivery";

export const dynamic = "force-dynamic";

// In-memory idempotency cache (scoped per user, expiring) to prevent duplicate orders on double-submit
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const idempotencyStore = new Map<string, { timestamp: number; order: any }>();

function pruneIdempotencyStore() {
  const cutoff = Date.now() - IDEMPOTENCY_TTL_MS;
  for (const [key, entry] of idempotencyStore.entries()) {
    if (entry.timestamp < cutoff) idempotencyStore.delete(key);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Orders contain customer PII (phone, address). Never expose them without a session.
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    // Release stock held by abandoned online-payment orders
    serverDB.expireStaleUnpaidOrders();

    let orders;
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      orders = serverDB.getOrders();
    } else if (user.role === "SELLER" || user.role === "BUSINESS_OWNER") {
      const sId = user.businessId || user.businessSlug;
      orders = sId ? serverDB.getSellerOrders(sId) : [];
    } else {
      // CUSTOMER and any other role: strictly their own orders (default deny)
      orders = serverDB.getCustomerOrders(user.id);
    }

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error("[Order List Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) {
      return NextResponse.json(
        { success: false, error: "Please sign in or create an account to place your order." },
        { status: 401 }
      );
    }
    const { user } = auth;

    pruneIdempotencyStore();
    const rawKey = req.headers.get("x-idempotency-key") || "";
    const idempotencyKey = rawKey ? `${user.id}:${rawKey}` : "";
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      const existing = idempotencyStore.get(idempotencyKey)!;
      return NextResponse.json({
        success: true,
        order: existing.order,
        isDuplicatePrevented: true,
      });
    }

    const body = await req.json();

    const customerName = sanitizeInput(body.customerName || user.name || "Customer", 80);
    const customerPhone = sanitizeInput(body.customerPhone || user.phone || "", 20);
    const customerEmail = sanitizeInput(body.customerEmail || user.email || "", 100);
    const county = sanitizeInput(body.county || "Nairobi", 50);
    const town = sanitizeInput(body.town || "Central", 50);
    const estate = sanitizeInput(body.estate || "Estate", 100);
    const deliveryNotes = body.deliveryNotes ? sanitizeInput(body.deliveryNotes, 200) : undefined;
    if (body.paymentMethod === "CARD") {
      return NextResponse.json(
        { success: false, error: "Card payments are not available yet. Please pay via M-Pesa or Pay on Delivery." },
        { status: 400 }
      );
    }
    const paymentMethod = body.paymentMethod === "COD" ? "COD" : "MPESA";
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
    if (rawItems.length > 100) {
      return NextResponse.json({ success: false, error: "Too many line items in a single order." }, { status: 400 });
    }

    // 1. Normalise & merge line items (same product listed twice must be stock-checked as one line)
    const requested = new Map<string, number>();
    for (const item of rawItems) {
      const productId = typeof item?.productId === "string" ? item.productId : "";
      if (!productId) {
        return NextResponse.json({ success: false, error: "Cart contains an invalid item." }, { status: 400 });
      }
      const parsedQty = Math.floor(Number(item.quantity));
      const qty = Number.isFinite(parsedQty) ? Math.max(1, Math.min(parsedQty, 50)) : 1;
      requested.set(productId, (requested.get(productId) || 0) + qty);
    }

    // 2. Validate EVERY line against authoritative server price & stock BEFORE touching inventory
    const orderItems: any[] = [];
    let subtotal = 0;
    let primarySellerId = "biz-1";
    let primarySellerName = "VendLex Marketplace";
    const reservations: Array<{ productId: string; qty: number }> = [];

    for (const [productId, qty] of requested.entries()) {
      const product = serverDB.getProductById(productId);
      if (!product) {
        return NextResponse.json({ success: false, error: `Product ID ${productId} is invalid or expired.` }, { status: 400 });
      }
      if (!(product.stockCount >= qty)) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for "${product.title}". Only ${Math.max(0, product.stockCount || 0)} remaining.`,
        }, { status: 400 });
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      if (orderItems.length === 0) {
        primarySellerId = product.businessId;
        primarySellerName = product.businessName;
      }

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
      reservations.push({ productId: product.id, qty });
    }

    // 3. All lines are valid: reserve stock (rolls back on any unexpected failure)
    const reserved: Array<{ productId: string; qty: number }> = [];
    for (const r of reservations) {
      if (!serverDB.decrementStock(r.productId, r.qty)) {
        for (const done of reserved) {
          const p = serverDB.getProductById(done.productId);
          if (p) serverDB.updateProduct(done.productId, { stockCount: p.stockCount + done.qty });
        }
        return NextResponse.json(
          { success: false, error: "An item just went out of stock. Please review your cart and try again." },
          { status: 409 }
        );
      }
      reserved.push(r);
    }

    const deliveryFee = calculateCountyDeliveryFee(county);
    let discountAmount = 0;
    if (promoCode === "KARIBU10" || promoCode === "SOKO10") {
      discountAmount = Math.round(subtotal * 0.1);
    }
    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    // Unique, human-friendly order number
    let orderNumber = "";
    do {
      orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    } while (serverDB.getOrderByNumber(orderNumber));

    const newOrder = serverDB.createOrder({
      orderNumber,
      customerId: user.id,
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
    serverDB.addNotification({
      userId: user.id,
      title: `Order ${newOrder.orderNumber} Created`,
      message: `Your order for ${orderItems.length} item(s) has been placed. Amount: KSh ${newOrder.totalAmount.toLocaleString()}.`,
      type: "ORDER",
      link: `/customer/dashboard`,
    });

    // In-app notification for the merchant (notifications are addressed to user ids, not business ids)
    const sellerUser = serverDB.findUserByBusiness(primarySellerId);
    if (sellerUser) {
      serverDB.addNotification({
        userId: sellerUser.id,
        title: `New Order ${newOrder.orderNumber}`,
        message: `${customerName} ordered ${orderItems.length} item(s) worth KSh ${newOrder.totalAmount.toLocaleString()}${paymentMethod === "COD" ? " (Pay on Delivery)" : " — awaiting payment"}.`,
        type: "ORDER",
        link: `/seller/orders`,
      });
    }

    serverDB.logAction({
      userId: user.id,
      userRole: user.role,
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
