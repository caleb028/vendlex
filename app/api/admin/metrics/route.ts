import { NextRequest, NextResponse } from "next/server";
import { serverDB } from "@/lib/server-db";
import { requireRole } from "@/lib/auth/session";
import { DocumentStore } from "@/lib/documents/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    const users = serverDB.getUsers();
    const orders = serverDB.getOrders();
    const products = serverDB.getProducts();
    const documents = DocumentStore.getAll();
    const disputes = serverDB.getDisputes();
    const pendingKYCs = serverDB.getKYCs({ status: "PENDING" });
    const supportTickets = serverDB.getSupportTickets();

    const totalGMV = orders
      .filter((o) => o.status === "PAID" || o.status === "DISPATCHED" || o.status === "DELIVERED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const escrowInVault = orders
      .filter((o) => o.status === "PAID" || o.status === "DISPATCHED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const activeSellers = users.filter((u) => u.role === "SELLER" || u.role === "BUSINESS_OWNER").length;
    const verifiedMerchants = users.filter((u) => u.isVerified && (u.role === "SELLER" || u.role === "BUSINESS_OWNER")).length;

    const openDisputes = disputes.filter((d) => d.status === "PENDING_REVIEW" || d.status === "INVESTIGATING").length;
    const openTickets = supportTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalGMV,
        escrowInVault,
        activeSellers,
        verifiedMerchants,
        pendingKYCsCount: pendingKYCs.length,
        openDisputesCount: openDisputes,
        openTicketsCount: openTickets,
        totalProducts: products.length,
        totalDocuments: documents.length,
        validDocuments: documents.filter((d) => d.status === "VALID").length,
        revokedDocuments: documents.filter((d) => d.status === "REVOKED").length,
        systemHealth: "100% OPERATIONAL",
      },
    });
  } catch (err: any) {
    console.error("[Admin Metrics Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to compute admin metrics." }, { status: 500 });
  }
}
