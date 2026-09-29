import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { getServerSession } from "@/lib/auth/session";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, isAuthenticated } = getServerSession(req);
    if (!isAuthenticated || !user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    const allUsers = serverDB.getUsers();
    const allOrders = serverDB.getOrders();
    const allProducts = serverDB.getProducts();
    const allKycs = serverDB.getKYCs();
    const allDisputes = serverDB.getDisputes();
    const allTickets = serverDB.getSupportTickets();
    const allAuditLogs = serverDB.getAuditLogs(20);
    const transactions = mpesaTransactionsStore.getAll().slice(0, 15);

    // Compute live real-time platform metrics
    const totalUsers = allUsers.length;
    const activeSellers = allUsers.filter(
      (u) => (u.role === "SELLER" || u.role === "BUSINESS_OWNER" || u.businessName) && u.status === "ACTIVE"
    ).length;
    const verifiedMerchants = allUsers.filter((u) => u.isVerified).length;

    const totalOrders = allOrders.length;
    const totalGMV = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const escrowInVault = allOrders
      .filter((o) => o.status === "PAID" || o.status === "PROCESSING" || o.status === "READY_FOR_DISPATCH" || o.status === "DISPATCHED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingKYCsCount = allKycs.filter((k) => k.status === "PENDING").length;
    const openDisputesCount = allDisputes.filter((d) => d.status === "PENDING_REVIEW" || d.status === "INVESTIGATING").length;
    const openTicketsCount = allTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

    // Recent activity list (sorted newest first)
    const recentOrders = [...allOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const recentAuditLogs = [...allAuditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers,
        activeSellers,
        verifiedMerchants,
        totalOrders,
        totalGMV,
        escrowInVault,
        totalProducts: allProducts.length,
        pendingKYCsCount,
        openDisputesCount,
        openTicketsCount,
        systemHealth: "100% OPERATIONAL (LIVE)",
      },
      recentOrders,
      recentAuditLogs,
      recentTransactions: transactions,
    });
  } catch (err: any) {
    console.error("[Admin Live Heartbeat Error]:", err?.message);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
