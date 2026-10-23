import { NextRequest, NextResponse } from "next/server";
import { querySTKPushStatus } from "@/lib/mpesa/daraja";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";
import type { MpesaTransaction } from "@/lib/mpesa/transaction-store";
import { getServerSession } from "@/lib/auth/session";
import { serverDB } from "@/lib/server-db";
import { maskPhoneNumber } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Strip PII / raw gateway payloads for non-admin callers. */
function publicTxn(txn: MpesaTransaction | undefined | null, isAdmin: boolean) {
  if (!txn) return null;
  if (isAdmin) return txn;
  const { rawCallback, ...rest } = txn;
  void rawCallback;
  return { ...rest, phoneNumber: maskPhoneNumber(rest.phoneNumber) };
}

async function handleQuery(req: NextRequest, checkoutRequestId: string) {
  const { user, isAuthenticated } = getServerSession(req);
  const isAdmin = Boolean(user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN"));

  if (!checkoutRequestId) {
    return NextResponse.json(
      { error: "checkoutRequestId is required." },
      { status: 400 }
    );
  }

  // The persisted order bound to this STK request is the source of truth for product payments
  // (the in-memory ledger can be empty on serverless instances).
  const linkedOrder = serverDB.getOrders().find((o) => o.checkoutRequestId === checkoutRequestId);
  if (linkedOrder) {
    if (!isAuthenticated || !user) {
      return NextResponse.json({ error: "Please sign in to check order payment status." }, { status: 401 });
    }
    if (linkedOrder.customerId !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorised to view this payment." }, { status: 403 });
    }
    if (linkedOrder.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        mpesaReceiptNumber: linkedOrder.mpesaReceipt,
        resultDesc: "Payment confirmed.",
      });
    }
  }

  // Check internal store first
  let storedTxn = mpesaTransactionsStore.getByCheckoutId(checkoutRequestId);
  if (!linkedOrder && storedTxn && !isAdmin && storedTxn.purpose === "PRODUCT_PURCHASE") {
    // Product payments must be tied to an order the caller owns
    return NextResponse.json({ error: "Not authorised to view this payment." }, { status: 403 });
  }
  if (!linkedOrder && (!isAuthenticated || !user) && storedTxn && storedTxn.purpose !== "ADVERTISEMENT") {
    return NextResponse.json({ error: "Please sign in to check payment status." }, { status: 401 });
  }

  // If already finished, return immediately
  if (storedTxn && (storedTxn.status === "COMPLETED" || storedTxn.status === "CANCELLED" || storedTxn.status === "FAILED")) {
    return NextResponse.json({
      success: true,
      status: storedTxn.status,
      mpesaReceiptNumber: storedTxn.mpesaReceiptNumber,
      transaction: publicTxn(storedTxn, isAdmin),
      resultDesc: storedTxn.resultDesc || "Transaction processed.",
    });
  }

  // If still pending or not yet resolved, query Daraja API
  try {
    const darajaQuery = await querySTKPushStatus(checkoutRequestId);

    if (darajaQuery.ResultCode === "0") {
      const receipt = storedTxn?.mpesaReceiptNumber || (darajaQuery as any).MpesaReceiptNumber || "";
      mpesaTransactionsStore.updateStatus(
        checkoutRequestId,
        "COMPLETED",
        receipt || undefined,
        darajaQuery.ResultDesc || "The service request is processed successfully."
      );
    } else if (darajaQuery.ResultCode === "1032") {
      mpesaTransactionsStore.updateStatus(
        checkoutRequestId,
        "CANCELLED",
        undefined,
        darajaQuery.ResultDesc || "Request cancelled by user."
      );
    } else if (darajaQuery.ResultCode && darajaQuery.ResultCode !== "0") {
      mpesaTransactionsStore.updateStatus(
        checkoutRequestId,
        "FAILED",
        undefined,
        darajaQuery.ResultDesc || "Payment declined or failed."
      );
    }

    storedTxn = mpesaTransactionsStore.getByCheckoutId(checkoutRequestId);

    return NextResponse.json({
      success: true,
      status: storedTxn?.status || (darajaQuery.ResultCode === "0" ? "COMPLETED" : "PENDING"),
      mpesaReceiptNumber: storedTxn?.mpesaReceiptNumber,
      transaction: publicTxn(storedTxn, isAdmin),
      ...(isAdmin ? { darajaQuery } : {}),
      resultDesc: darajaQuery.ResultDesc,
    });
  } catch (darajaErr: any) {
    return NextResponse.json({
      success: true,
      status: storedTxn?.status || "PENDING",
      mpesaReceiptNumber: storedTxn?.mpesaReceiptNumber,
      transaction: publicTxn(storedTxn, isAdmin),
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const checkoutRequestId = req.nextUrl.searchParams.get("checkoutRequestId") || "";
    return await handleQuery(req, checkoutRequestId);
  } catch (error: any) {
    console.error("STK Query GET API Route error:", error);
    return NextResponse.json(
      { error: "Failed to query M-Pesa transaction status." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const checkoutRequestId = body.checkoutRequestId || req.nextUrl.searchParams.get("checkoutRequestId") || "";
    return await handleQuery(req, checkoutRequestId);
  } catch (error: any) {
    console.error("STK Query POST API Route error:", error);
    return NextResponse.json(
      { error: "Failed to query M-Pesa transaction status." },
      { status: 500 }
    );
  }
}
