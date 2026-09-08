import { NextRequest, NextResponse } from "next/server";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";
import { maskPhoneNumber } from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("x-api-key");
  const adminSecret = process.env.ADMIN_API_SECRET || "vendlex_admin_secret_key";

  // Check if caller has verified admin credentials
  const isAdmin = authHeader === `Bearer ${adminSecret}` || apiKey === adminSecret;

  const rawTransactions = mpesaTransactionsStore.getAll();
  const totalVolume = mpesaTransactionsStore.getTotalVolume();

  // If not authenticated admin, mask sensitive PII (Data Protection compliance)
  const transactions = rawTransactions.map((txn) => {
    if (isAdmin) return txn;
    return {
      ...txn,
      phoneNumber: maskPhoneNumber(txn.phoneNumber),
      // Mask receipt number partially if unauthenticated
      mpesaReceiptNumber: txn.mpesaReceiptNumber ? `${txn.mpesaReceiptNumber.slice(0, 4)}****` : undefined,
    };
  });

  return NextResponse.json({
    success: true,
    totalVolume,
    transactionCount: transactions.length,
    isMasked: !isAdmin,
    transactions,
  });
}
