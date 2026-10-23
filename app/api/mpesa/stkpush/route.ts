import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush, formatPhoneForDaraja, DEFAULT_DARAJA_CONFIG } from "@/lib/mpesa/daraja";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import {
  isValidKenyanPhone,
  sanitizeInput,
  validateTransactionAmount,
  checkRateLimit,
} from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    const isAdmin = Boolean(user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN"));

    const body = await req.json();
    const {
      phoneNumber,
      amount,
      accountReference = "VENDLEX",
      transactionDesc = "Payment",
      purpose = "GENERAL",
      sellerId,
      sellerName = "Merchant",
    } = body;

    // Require authentication for all payment prompts EXCEPT self-serve business advertisement submissions
    if ((!isAuthenticated || !user) && purpose !== "ADVERTISEMENT") {
      return NextResponse.json({ error: "Please sign in to make a payment." }, { status: 401 });
    }

    // 1. Strict Phone Validation
    if (!phoneNumber || !isValidKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid Kenyan phone number. Use format 07XXXXXXXX or 2547XXXXXXXX." },
        { status: 400 }
      );
    }

    const safeAccountRef = sanitizeInput(accountReference, 30) || "VENDLEX";

    // 2. Determine the authoritative amount.
    //    For product purchases the amount is ALWAYS the server-side order total, never the client's
    //    figure, and the order must belong to the caller and still be awaiting payment.
    let numAmount: number;
    let linkedOrderId: string | undefined;

    if (purpose === "PRODUCT_PURCHASE") {
      if (!user) {
        return NextResponse.json({ error: "Please sign in to pay for an order." }, { status: 401 });
      }
      const order = serverDB.getOrderByNumber(safeAccountRef);
      if (!order) {
        return NextResponse.json({ error: "Order not found for this payment." }, { status: 404 });
      }
      if (order.customerId !== user.id && !isAdmin) {
        return NextResponse.json({ error: "You can only pay for your own orders." }, { status: 403 });
      }
      if (order.status !== "PENDING_PAYMENT") {
        return NextResponse.json(
          { error: order.status === "CANCELLED" ? "This order has expired or was cancelled. Please place a new order." : "This order has already been paid." },
          { status: 409 }
        );
      }
      if (order.paymentMethod !== "MPESA") {
        return NextResponse.json({ error: "This order is not set up for M-Pesa payment." }, { status: 400 });
      }
      const orderAmount = validateTransactionAmount(order.totalAmount, 1, 300000);
      if (!orderAmount.valid || !orderAmount.amount) {
        return NextResponse.json({ error: orderAmount.error || "Invalid order amount." }, { status: 400 });
      }
      numAmount = orderAmount.amount;
      linkedOrderId = order.id;
    } else if (purpose === "ADVERTISEMENT") {
      numAmount = 1020; // Authoritative 30-day advertisement fee
    } else {
      const amountValidation = validateTransactionAmount(amount, 1, 300000);
      if (!amountValidation.valid || !amountValidation.amount) {
        return NextResponse.json(
          { error: amountValidation.error || "Invalid transaction amount." },
          { status: 400 }
        );
      }
      numAmount = amountValidation.amount;
    }

    const formattedPhone = formatPhoneForDaraja(phoneNumber);

    // 3. Per-Phone Rate Limiting (Prevent SMS STK Push spam & toll fraud)
    const phoneRateKey = `stk_phone:${formattedPhone}`;
    const { allowed: phoneAllowed } = checkRateLimit(phoneRateKey, 5, 2 * 60 * 1000);
    if (!phoneAllowed) {
      return NextResponse.json(
        { error: "Too many payment prompts sent to this phone number. Please wait 2 minutes." },
        { status: 429 }
      );
    }

    // 4. Sanitize Metadata
    const safeTxnDesc = sanitizeInput(transactionDesc, 50) || "Marketplace Purchase";
    const safeSellerName = sanitizeInput(sellerName, 60) || "Merchant";
    const safeSellerId = sellerId ? sanitizeInput(sellerId, 40) : undefined;

    // 5. Call Daraja API
    const darajaResponse = await initiateSTKPush({
      phoneNumber: formattedPhone,
      amount: numAmount,
      accountReference: safeAccountRef,
      transactionDesc: safeTxnDesc,
    });

    // 6. Record initial transaction in pending state
    const txnRecord = {
      id: `txn-${Date.now()}`,
      checkoutRequestId: darajaResponse.CheckoutRequestID,
      merchantRequestId: darajaResponse.MerchantRequestID,
      phoneNumber: formattedPhone,
      amount: numAmount,
      accountReference: safeAccountRef,
      transactionDesc: safeTxnDesc,
      purpose: purpose as any,
      sellerId: safeSellerId,
      sellerName: safeSellerName,
      status: "PENDING" as const,
      resultDesc: darajaResponse.ResponseDescription,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    mpesaTransactionsStore.add(txnRecord);

    // 7. Bind this STK request to the order so the callback reconciles exactly that order
    if (linkedOrderId) {
      serverDB.setOrderCheckoutRequest(linkedOrderId, darajaResponse.CheckoutRequestID);
    }

    return NextResponse.json({
      success: true,
      message: darajaResponse.CustomerMessage,
      checkoutRequestId: darajaResponse.CheckoutRequestID,
      merchantRequestId: darajaResponse.MerchantRequestID,
      responseCode: darajaResponse.ResponseCode,
      shortcode: DEFAULT_DARAJA_CONFIG.shortcode,
      environment: DEFAULT_DARAJA_CONFIG.environment,
    });
  } catch (error: any) {
    console.error("STK Push API Route error:", error);
    return NextResponse.json(
      { error: "Failed to initiate M-Pesa STK Push. Please check your network and try again." },
      { status: 500 }
    );
  }
}
