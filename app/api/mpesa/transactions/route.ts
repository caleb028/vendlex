import { NextRequest, NextResponse } from "next/server";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";
import { timingSafeCompare } from "@/lib/security";
import { getServerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("x-api-key");
  // No default secret: API-key access is only enabled when ADMIN_API_SECRET is configured.
  const adminSecret = process.env.ADMIN_API_SECRET;

  const { user, isAuthenticated } = getServerSession(req);
  const isSessionAdmin = isAuthenticated && user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  const hasValidSecret =
    !!adminSecret &&
    ((!!authHeader && timingSafeCompare(authHeader, `Bearer ${adminSecret}`)) ||
      (!!apiKey && timingSafeCompare(apiKey, adminSecret)));

  // Check if caller has verified admin credentials
  const isAdmin = !!isSessionAdmin || hasValidSecret;

  // Only admins may list the ledger at all; everyone else gets an empty, masked summary.
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const rawTransactions = mpesaTransactionsStore.getAll();
  const totalVolume = mpesaTransactionsStore.getTotalVolume();

  const transactions = rawTransactions.map((txn) => ({
    ...txn,
    phoneNumber: txn.phoneNumber,
  }));

  return NextResponse.json({
    success: true,
    totalVolume,
    transactionCount: transactions.length,
    isMasked: false,
    transactions,
  });
}
