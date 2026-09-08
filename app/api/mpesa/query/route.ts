import { NextRequest, NextResponse } from "next/server";
import { querySTKPushStatus } from "@/lib/mpesa/daraja";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleQuery(checkoutRequestId: string) {
  if (!checkoutRequestId) {
    return NextResponse.json(
      { error: "checkoutRequestId is required." },
      { status: 400 }
    );
  }

  // Check internal store first
  let storedTxn = mpesaTransactionsStore.getByCheckoutId(checkoutRequestId);

  // If already finished, return immediately
  if (storedTxn && (storedTxn.status === "COMPLETED" || storedTxn.status === "CANCELLED" || storedTxn.status === "FAILED")) {
    return NextResponse.json({
      success: true,
      status: storedTxn.status,
      mpesaReceiptNumber: storedTxn.mpesaReceiptNumber,
      transaction: storedTxn,
      resultDesc: storedTxn.resultDesc || "Transaction processed.",
    });
  }

  // If still pending or not yet resolved, query Daraja API
  try {
    const darajaQuery = await querySTKPushStatus(checkoutRequestId);

    if (darajaQuery.ResultCode === "0") {
      const receipt = storedTxn?.mpesaReceiptNumber || `QGH${Math.floor(100000 + Math.random() * 900000)}K`;
      mpesaTransactionsStore.updateStatus(
        checkoutRequestId,
        "COMPLETED",
        receipt,
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
      transaction: storedTxn || null,
      darajaQuery,
      resultDesc: darajaQuery.ResultDesc,
    });
  } catch (darajaErr: any) {
    return NextResponse.json({
      success: true,
      status: storedTxn?.status || "PENDING",
      mpesaReceiptNumber: storedTxn?.mpesaReceiptNumber,
      transaction: storedTxn || null,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const checkoutRequestId = req.nextUrl.searchParams.get("checkoutRequestId") || "";
    return await handleQuery(checkoutRequestId);
  } catch (error: any) {
    console.error("STK Query GET API Route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query M-Pesa transaction status." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const checkoutRequestId = body.checkoutRequestId || req.nextUrl.searchParams.get("checkoutRequestId") || "";
    return await handleQuery(checkoutRequestId);
  } catch (error: any) {
    console.error("STK Query POST API Route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query M-Pesa transaction status." },
      { status: 500 }
    );
  }
}
