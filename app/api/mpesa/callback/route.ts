import { NextRequest, NextResponse } from "next/server";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";
import { timingSafeCompare, sanitizeInput } from "@/lib/security";
import { serverDB } from "@/lib/server-db";
import { DocumentService } from "@/lib/documents/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Optional Webhook Secret Verification (if configured)
    const webhookSecret = process.env.MPESA_CALLBACK_SECRET;
    if (webhookSecret) {
      const authHeader = req.headers.get("x-callback-secret") || req.nextUrl.searchParams.get("secret");
      if (!authHeader || !timingSafeCompare(authHeader, webhookSecret)) {
        console.warn("[SECURITY ALERT] Unauthorized M-Pesa Callback attempt blocked.");
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized Callback" }, { status: 401 });
      }
    }

    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Missing callback payload." }, { status: 400 });
    }

    const stkCallback = rawBody?.Body?.stkCallback;
    if (!stkCallback || !stkCallback.CheckoutRequestID) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback payload format." }, { status: 400 });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    let mpesaReceiptNumber: string | undefined;
    let amountPaid: number | undefined;
    let phoneNumber: string | undefined;
    let transactionDate: string | undefined;

    if (CallbackMetadata?.Item && Array.isArray(CallbackMetadata.Item)) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") {
          mpesaReceiptNumber = sanitizeInput(String(item.Value), 30);
        } else if (item.Name === "Amount") {
          amountPaid = Number(item.Value);
        } else if (item.Name === "PhoneNumber") {
          phoneNumber = sanitizeInput(String(item.Value), 20);
        } else if (item.Name === "TransactionDate") {
          transactionDate = sanitizeInput(String(item.Value), 20);
        }
      }
    }

    // Determine Status
    // ResultCode 0 = Success
    // 1032 = Cancelled by user
    // 1 = Insufficient funds
    // 2001 = Wrong PIN
    const isSuccess = ResultCode === 0;
    const finalStatus = isSuccess ? "COMPLETED" : ResultCode === 1032 ? "CANCELLED" : "FAILED";

    // Check idempotency: if transaction already processed, skip duplicate work
    const existingTxn = mpesaTransactionsStore.getByCheckoutId(CheckoutRequestID);
    if (existingTxn && existingTxn.status === "COMPLETED") {
      console.log(`[M-PESA DARAJA] Duplicate callback ignored for ${CheckoutRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Duplicate callback already processed." });
    }

    const safeReceipt = mpesaReceiptNumber || `SIM-${Date.now().toString().slice(-6)}`;

    // Update in-memory and database transaction records
    mpesaTransactionsStore.updateStatus(
      sanitizeInput(CheckoutRequestID, 60),
      finalStatus,
      safeReceipt,
      sanitizeInput(ResultDesc || "Processed", 120),
      rawBody
    );

    console.log(`[M-PESA DARAJA] Checkout ID ${CheckoutRequestID} updated to ${finalStatus}. Receipt: ${safeReceipt}`);

    // Reconcile with matching Order in Server Database
    if (isSuccess) {
      // Find order by matching checkoutRequestId or accountReference
      const allOrders = serverDB.getOrders();
      const matchingOrder = allOrders.find(
        (o) =>
          o.checkoutRequestId === CheckoutRequestID ||
          (existingTxn?.accountReference && o.orderNumber === existingTxn.accountReference) ||
          o.status === "PENDING_PAYMENT"
      );

      if (matchingOrder) {
        // Automatically issue verified VendLex document receipt
        let docId: string | undefined;
        try {
          const doc = DocumentService.issueOrderReceipt({
            id: matchingOrder.id,
            orderNumber: matchingOrder.orderNumber,
            customerId: matchingOrder.customerId,
            customerName: matchingOrder.customerName,
            customerPhone: matchingOrder.customerPhone,
            customerEmail: matchingOrder.customerEmail,
            sellerId: matchingOrder.sellerId,
            sellerName: matchingOrder.sellerName,
            county: matchingOrder.county,
            totalAmount: matchingOrder.totalAmount,
            mpesaReceipt: safeReceipt,
            courierTracking: matchingOrder.courierTracking,
            items: matchingOrder.items,
          });
          docId = doc.publicDocumentId;
        } catch (docErr) {
          console.error("Failed to generate document for order:", docErr);
        }

        // Update order status to PAID
        serverDB.updateOrderStatus(matchingOrder.id, "PAID", {
          mpesaReceipt: safeReceipt,
          paymentStatus: "PAID",
          documentId: docId,
        });

        // Notify Buyer
        serverDB.addNotification({
          userId: matchingOrder.customerId,
          title: "Payment Confirmed via M-Pesa!",
          message: `Your payment of KSh ${matchingOrder.totalAmount.toLocaleString()} for ${matchingOrder.orderNumber} is confirmed (Receipt: ${safeReceipt}). Verified official receipt issued.`,
          type: "PAYMENT",
          link: docId ? `/verify/${docId}` : "/account/documents",
        });

        // Notify Seller
        serverDB.addNotification({
          userId: matchingOrder.sellerId,
          title: "New Paid Order Received",
          message: `Order ${matchingOrder.orderNumber} has been paid via M-Pesa (${safeReceipt}). Please prepare for dispatch.`,
          type: "ORDER",
          link: "/seller/orders",
        });

        // 4. Dispatch Backend-Verified Purchase Conversion Event to Marketing Engine
        try {
          const { VendLexMarketingEngine } = await import("@/lib/marketing/engine");
          await VendLexMarketingEngine.trackVerifiedPurchase({
            id: matchingOrder.id,
            orderNumber: matchingOrder.orderNumber,
            customerId: matchingOrder.customerId,
            customerName: matchingOrder.customerName,
            customerEmail: matchingOrder.customerEmail,
            customerPhone: matchingOrder.customerPhone,
            sellerId: matchingOrder.sellerId,
            sellerName: matchingOrder.sellerName,
            county: matchingOrder.county,
            totalAmount: matchingOrder.totalAmount,
            items: matchingOrder.items.map((i) => ({
              productId: i.productId,
              productTitle: i.productTitle,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              sellerId: i.sellerId,
              sellerName: i.sellerName,
            })),
            attribution: matchingOrder.attribution,
          });
        } catch (mktErr) {
          console.error("[Marketing] Failed to record purchase conversion:", mktErr);
        }
      }
    }

    // Return standard 200 OK acknowledgment required by Safaricom Daraja
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted and Processed",
    });
  } catch (error: any) {
    console.error("M-Pesa Callback Error:", error);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "VendLex Safaricom Daraja Webhook Listener",
    timestamp: new Date().toISOString(),
  });
}
