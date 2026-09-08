import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { calculateCountyDeliveryFee } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawItems: CartItemInput[] = Array.isArray(body.items) ? body.items : [];
    const county: string = body.deliveryCounty || "Nairobi";
    const promoCode: string = (body.promoCode || "").trim().toUpperCase();

    if (rawItems.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        discountAmount: 0,
        totalAmount: 0,
      });
    }

    const validatedItems: any[] = [];
    let subtotal = 0;
    const errors: string[] = [];

    for (const item of rawItems) {
      const product = serverDB.getProductById(item.productId);
      if (!product) {
        errors.push(`Item ID ${item.productId} was not found in catalog.`);
        continue;
      }

      const qty = Math.max(1, Math.min(item.quantity || 1, 50));
      if (!product.inStock || product.stockCount < qty) {
        errors.push(`"${product.title}" has insufficient stock (only ${product.stockCount} left).`);
      }

      // CRITICAL: Force server price, NEVER trust client price
      const unitPrice = product.price;
      const totalPrice = unitPrice * qty;
      subtotal += totalPrice;

      validatedItems.push({
        productId: product.id,
        productTitle: product.title,
        sku: product.sku,
        image: product.images[0] || "",
        unitPrice,
        quantity: qty,
        totalPrice,
        sellerId: product.businessId,
        sellerName: product.businessName,
        county: product.county,
      });
    }

    const deliveryFee = validatedItems.length > 0 ? calculateCountyDeliveryFee(county) : 0;

    let discountAmount = 0;
    if (promoCode === "KARIBU10" || promoCode === "SOKO10") {
      discountAmount = Math.round(subtotal * 0.1);
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    return NextResponse.json({
      success: errors.length === 0,
      items: validatedItems,
      subtotal,
      deliveryFee,
      discountAmount,
      totalAmount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("[Cart Validate Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to validate cart." }, { status: 500 });
  }
}
