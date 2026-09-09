"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { formatKSh } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Zap,
  Key,
  RefreshCw,
  Send,
  Truck,
  MessageSquare,
  MapPin,
  ExternalLink,
  Search,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Store,
  HelpCircle,
  Megaphone,
  LogOut,
  Package,
  Mail,
} from "lucide-react";
import { AICountyHeatmap } from "@/components/ai/ai-county-heatmap";
import {
  ServerSupportTicket,
  ServerAdvertisement,
  ServerOrder,
  ServerKYC,
  ServerDispute,
} from "@/lib/server-db/types";
import { VendLexDocument } from "@/lib/documents/types";

interface MpesaTxn {
  id: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  purpose: string;
  sellerName?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  timestamp: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    "overview" | "support" | "kyc" | "orders" | "disputes" | "daraja" | "documents" | "heatmap" | "advertisements"
  >("overview");

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Real-World Platform Metrics (Zero initialized, strictly computed from real database)
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalGMV: 0,
    escrowInVault: 0,
    activeSellers: 0,
    verifiedMerchants: 0,
    pendingKYCsCount: 0,
    openDisputesCount: 0,
    openTicketsCount: 0,
    totalProducts: 0,
    totalDocuments: 0,
    validDocuments: 0,
    systemHealth: "100% OPERATIONAL",
  });

  // Live Server Database Collections
  const [orders, setOrders] = useState<ServerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [kycs, setKycs] = useState<ServerKYC[]>([]);
  const [loadingKycs, setLoadingKycs] = useState(false);

  const [disputes, setDisputes] = useState<ServerDispute[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);

  const [supportTickets, setSupportTickets] = useState<ServerSupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<ServerSupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [advertisements, setAdvertisements] = useState<ServerAdvertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [adFilterStatus, setAdFilterStatus] = useState<string>("ALL");

  const [documents, setDocuments] = useState<VendLexDocument[]>([]);
  const [docSearchQuery, setDocSearchQuery] = useState("");

  const [transactions, setTransactions] = useState<MpesaTxn[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  // Daraja Gateway Configuration
  const [shortcode, setShortcode] = useState("174379");
  const [consumerKey, setConsumerKey] = useState("k0kU8oM4Y8w6p6PZ2eZ7sR8Q1A1b2c3d");
  const [passkey, setPasskey] = useState("bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919");
  const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/api/mpesa/callback` : "https://vendlex.vercel.app/api/mpesa/callback";

  // STK Test Trigger State
  const [testPhone, setTestPhone] = useState("0712345678");
  const [testAmount, setTestAmount] = useState("10");
  const [isTriggeringSTK, setIsTriggeringSTK] = useState(false);
  const [stkFeedback, setStkFeedback] = useState<string | null>(null);

  // Dispute Action Modal State
  const [resolvingDispute, setResolvingDispute] = useState<{ id: string; action: "RESOLVE" | "REJECT" } | null>(null);
  const [disputeNotes, setDisputeNotes] = useState("");

  // =========================================================================
  // REAL-WORLD DATA FETCHERS (Live from persistent server database)
  // =========================================================================
  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.warn("Metrics fetch warning:", e);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.warn("Orders fetch warning:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchKycs = async () => {
    setLoadingKycs(true);
    try {
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.success && Array.isArray(data.kycs)) {
        setKycs(data.kycs);
      }
    } catch (e) {
      console.warn("KYC fetch warning:", e);
    } finally {
      setLoadingKycs(false);
    }
  };

  const fetchDisputes = async () => {
    setLoadingDisputes(true);
    try {
      const res = await fetch("/api/disputes");
      const data = await res.json();
      if (data.success && Array.isArray(data.disputes)) {
        setDisputes(data.disputes);
      }
    } catch (e) {
      console.warn("Disputes fetch warning:", e);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const fetchSupportTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      if (data.success && data.tickets) {
        setSupportTickets(data.tickets);
      }
    } catch (e) {
      console.warn("Tickets fetch warning:", e);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents?role=ADMIN");
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.warn("Documents fetch warning:", e);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTxns(true);
    try {
      const res = await fetch("/api/mpesa/transactions");
      const data = await res.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.warn("Transactions fetch warning:", e);
    } finally {
      setLoadingTxns(false);
    }
  };

  const fetchAdvertisements = async () => {
    setLoadingAds(true);
    try {
      const res = await fetch("/api/admin/advertisements");
      const data = await res.json();
      if (data.success && Array.isArray(data.advertisements)) {
        setAdvertisements(data.advertisements);
      }
    } catch (e) {
      console.warn("Advertisements fetch warning:", e);
    } finally {
      setLoadingAds(false);
    }
  };

  const refreshAllData = () => {
    fetchMetrics();
    fetchOrders();
    fetchKycs();
    fetchDisputes();
    fetchSupportTickets();
    fetchDocuments();
    fetchTransactions();
    fetchAdvertisements();
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // =========================================================================
  // REAL-WORLD ACTION HANDLERS (Mutates live database)
  // =========================================================================
  const handleOrderStatusAction = async (id: string, newStatus: ServerOrder["status"]) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Order #${id} status updated to ${newStatus.replace("_", " ")}.`);
        setTimeout(() => setActionSuccess(null), 3500);
        fetchOrders();
        fetchMetrics();
      }
    } catch (e) {
      console.error("Order status update error:", e);
    }
  };

  const handleKycAction = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`KYC submission #${id} marked as ${newStatus}. Verified credentials issued.`);
        setTimeout(() => setActionSuccess(null), 3500);
        fetchKycs();
        fetchMetrics();
      }
    } catch (e) {
      console.error("KYC action error:", e);
    }
  };

  const handleResolveDispute = async (id: string, status: "RESOLVED" | "REJECTED", notes?: string) => {
    try {
      const res = await fetch("/api/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, resolutionNotes: notes || "Resolved by Platform Admin" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Dispute #${id} has been marked as ${status}.`);
        setTimeout(() => setActionSuccess(null), 3500);
        setResolvingDispute(null);
        setDisputeNotes("");
        fetchDisputes();
        fetchMetrics();
      }
    } catch (e) {
      console.error("Dispute resolve error:", e);
    }
  };

  const handleApproveAd = async (id: string) => {
    try {
      const res = await fetch("/api/admin/advertisements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Advertisement #${id} approved! Ad is now active across Kenya for 30 days.`);
        setTimeout(() => setActionSuccess(null), 3500);
        fetchAdvertisements();
      }
    } catch (e) {
      console.error("Approve ad error:", e);
    }
  };

  const handleRejectAd = async (id: string, reason: string) => {
    if (!reason.trim()) return;
    try {
      const res = await fetch("/api/admin/advertisements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject", reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Advertisement #${id} rejected with reason communicated to advertiser.`);
        setTimeout(() => setActionSuccess(null), 3500);
        fetchAdvertisements();
      }
    } catch (e) {
      console.error("Reject ad error:", e);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setActionSuccess(`Support Ticket ${data.ticket.ticketNumber} updated to ${newStatus}.`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchSupportTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;
    setIsSendingReply(true);

    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: adminReplyText.trim(),
          senderName: user?.name || "VendLex Support HQ",
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setSelectedTicket(data.ticket);
        setAdminReplyText("");
        setActionSuccess(`Reply dispatched to ${data.ticket.userName} (${data.ticket.userEmail || data.ticket.userPhone}).`);
        setTimeout(() => setActionSuccess(null), 3500);
        fetchSupportTickets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleTestSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriggeringSTK(true);
    setStkFeedback(null);

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: testPhone,
          amount: parseFloat(testAmount),
          accountReference: "ADMIN-TEST",
          transactionDesc: "VendLex Daraja Live Test",
          sellerName: "Admin Command Center",
          purpose: "SUBSCRIPTION",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStkFeedback(`✓ Lipa na M-Pesa STK Prompt sent to ${testPhone}! Checkout Request ID: ${data.checkoutRequestId}`);
        fetchTransactions();
      } else {
        setStkFeedback(`Error: ${data.error || "Failed to trigger STK Push."}`);
      }
    } catch (err: any) {
      setStkFeedback(`Error: ${err.message}`);
    } finally {
      setIsTriggeringSTK(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      if (ticketFilterStatus !== "ALL" && t.status !== ticketFilterStatus) return false;
      return true;
    });
  }, [supportTickets, ticketFilterStatus]);

  const filteredDocs = useMemo(() => {
    if (!docSearchQuery.trim()) return documents;
    const q = docSearchQuery.toLowerCase().trim();
    return documents.filter(
      (d) =>
        d.publicDocumentId.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        d.sellerName.toLowerCase().includes(q)
    );
  }, [documents, docSearchQuery]);

  const filteredAds = useMemo(() => {
    return advertisements.filter((a) => {
      if (adFilterStatus !== "ALL" && a.status !== adFilterStatus) return false;
      return true;
    });
  }, [advertisements, adFilterStatus]);

  // =========================================================================
  // AUTHENTICATED SUPERADMIN COMMAND CENTER (Zero-Trust Guarded)
  // =========================================================================
  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Executive Header Strip */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-emerald">
                {metrics.systemHealth} • NAIROBI HQ
              </span>
              <span className="text-[10px] bg-red-100 dark:bg-red-950 text-brand-red font-black px-2 py-0.5 rounded-full">
                SUPERADMIN
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              VendLex Platform Operations Command Center
            </h1>
            <p className="text-xs text-muted-foreground">
              Live marketplace oversight: Real M-Pesa transactions, active merchant stores, verified KYC accreditations &amp; dispute mediation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={refreshAllData}
              className="px-3 py-2 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border transition-colors flex items-center gap-1.5"
              title="Refresh all live database collections"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Refresh Live Data</span>
            </button>

            <Link
              href="/admin/marketing"
              className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-brand-emerald font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Marketing &amp; Ads</span>
            </Link>

            <Link
              href="/admin/documents"
              className="px-3 py-2 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Document Vault</span>
            </Link>

            <Link
              href="/admin/mail"
              className="px-3 py-2 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Email Spool</span>
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="px-3 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1.5"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 4 Real-World KPI Metric Cards (Strictly live calculations) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Gross Platform Volume</span>
              <TrendingUp className="w-4 h-4 text-brand-emerald" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-brand-emerald">{formatKSh(metrics.totalGMV)}</div>
            <span className="text-[10px] text-muted-foreground">{metrics.totalOrders} total completed orders</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Escrow In Vault</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">{formatKSh(metrics.escrowInVault)}</div>
            <span className="text-[10px] text-brand-emerald font-semibold">Active protected orders</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Active Merchants</span>
              <Store className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">{metrics.activeSellers} Stores</div>
            <span className="text-[10px] text-muted-foreground">{metrics.verifiedMerchants} Verified Badges</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Support Desk Inquiries</span>
              <HelpCircle className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-600">{metrics.openTicketsCount} Open</div>
            <span className="text-[10px] text-muted-foreground">{supportTickets.length} total inquiries logged</span>
          </div>
        </div>

        {/* Tab Selector Navigation Bar */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview &amp; Health</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "support"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support Desk ({supportTickets.filter((t) => t.status === "OPEN").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "kyc"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Merchant KYC Queue ({kycs.filter((k) => k.status === "PENDING").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "orders"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Orders &amp; Escrow ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "disputes"
                ? "bg-brand-red text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-brand-red" />
            <span>Disputes &amp; Fraud ({disputes.filter((d) => d.status === "PENDING_REVIEW").length})</span>
          </button>

          <button
            onClick={() => setActiveTab("daraja")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "daraja"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Daraja API &amp; Ledger ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "documents"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Verified Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "heatmap"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>47-County Demand</span>
          </button>

          <button
            onClick={() => setActiveTab("advertisements")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === "advertisements"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>
              Business Ads ({advertisements.filter((a) => a.status === "PENDING_REVIEW").length} Pending)
            </span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW & PLATFORM HEALTH                       */}
        {/* ================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 8 Cols: Operational Overview */}
              <div className="lg:col-span-8 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-emerald" />
                      <span>Live Platform Operations Feed</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Real-time settlements, merchant verifications &amp; logistics monitoring.</p>
                  </div>
                  <button
                    onClick={refreshAllData}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                      <div>
                        <div className="font-bold text-foreground">Safaricom Daraja 2.0 Webhook Active</div>
                        <div className="text-[11px] text-muted-foreground">Listening at /api/mpesa/callback • Real-time STK settlement</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-brand-emerald bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                      HEALTHY
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/20 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground">Merchant Accreditation &amp; Certificate Generator</div>
                        <div className="text-[11px] text-muted-foreground">Generates verifiable PDF receipts, invoices &amp; certificates</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                      ONLINE
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/20 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground">Marketing &amp; Growth Engine Active</div>
                        <div className="text-[11px] text-muted-foreground">Syndicates active product catalog across all 47 counties</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Orders in Vault</span>
                    <div className="font-black text-foreground text-sm">{orders.filter((o) => o.status === "PAID" || o.status === "DISPATCHED").length} Active</div>
                    <span className="text-[10px] text-brand-emerald font-semibold">Protected Escrow</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">KYC Submissions</span>
                    <div className="font-black text-foreground text-sm">{kycs.length} Total</div>
                    <span className="text-[10px] text-blue-600 font-semibold">{kycs.filter((k) => k.status === "APPROVED").length} Verified</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Open Disputes</span>
                    <div className="font-black text-foreground text-sm">{disputes.filter((d) => d.status === "PENDING_REVIEW").length} Pending</div>
                    <span className="text-[10px] text-brand-emerald font-semibold">Live Heuristic Guard</span>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Quick Administrative Actions */}
              <div className="lg:col-span-4 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-gold" />
                    <span>Quick Admin Operations</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Direct management shortcuts.</p>
                </div>

                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setActiveTab("support")}
                    className="w-full text-left p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border font-bold text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>Manage Support Desk ({supportTickets.filter((t) => t.status === "OPEN").length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="w-full text-left p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border font-bold text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>Review Pending KYC Queue ({kycs.filter((k) => k.status === "PENDING").length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setActiveTab("orders")}
                    className="w-full text-left p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border font-bold text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>Manage Orders &amp; Escrow ({orders.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setActiveTab("daraja")}
                    className="w-full text-left p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border font-bold text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>Test Lipa na M-Pesa STK Push</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>

                  <Link
                    href="/admin/marketing/campaigns"
                    className="w-full block p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border font-bold text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>Launch National Ad Campaign</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/admin/documents"
                    className="w-full block p-3 rounded-xl bg-muted/30 hover:bg-muted border border-border font-bold text-foreground flex items-center justify-between transition-colors"
                  >
                    <span>Inspect Document Vault ({documents.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SUPPORT DESK & HELP INQUIRIES                              */}
        {/* ================================================================= */}
        {activeTab === "support" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-emerald" />
                  <span>Customer Care &amp; Merchant Support Desk</span>
                </h3>
                <p className="text-xs text-muted-foreground">Manage inquiries, reply to buyers and sellers, and assign ticket statuses.</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={ticketFilterStatus}
                  onChange={(e) => setTicketFilterStatus(e.target.value)}
                  className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                >
                  <option value="ALL">All Ticket Statuses</option>
                  <option value="OPEN">Open (Requires Action)</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <button
                  onClick={fetchSupportTickets}
                  className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Ticket List (Left 7 Cols) */}
              <div className="lg:col-span-7 space-y-3">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                    No support tickets found matching filter.
                  </div>
                ) : (
                  filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                        selectedTicket?.id === t.id
                          ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-brand-emerald shadow-xs"
                          : "bg-muted/20 hover:bg-muted/40 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded">
                            {t.ticketNumber}
                          </span>
                          <span className="font-bold text-xs text-foreground truncate max-w-[240px]">
                            {t.subject}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          t.status === "RESOLVED" || t.status === "CLOSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <div>
                          From: <strong className="text-foreground">{t.userName}</strong> ({t.userPhone || t.userEmail})
                        </div>
                        <div>{new Date(t.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>

                      {t.orderNumber && (
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Order Ref: <strong className="text-foreground">{t.orderNumber}</strong>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Ticket Details & Reply Panel (Right 5 Cols) */}
              <div className="lg:col-span-5 bg-muted/20 border border-border rounded-2xl p-5 space-y-4">
                {selectedTicket ? (
                  <>
                    <div className="border-b border-border/80 pb-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-brand-emerald">
                          {selectedTicket.ticketNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleTicketStatusChange(selectedTicket.id, "RESOLVED")}
                            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            ✓ Mark Resolved
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{selectedTicket.subject}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Category: <strong>{selectedTicket.category.replace("_", " ")}</strong> • Priority: <strong>{selectedTicket.priority}</strong>
                      </p>
                    </div>

                    {/* Messages Thread */}
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin text-xs">
                      {selectedTicket.messages?.map((m) => {
                        const isAdmin = m.senderRole === "ADMIN";
                        return (
                          <div
                            key={m.id}
                            className={`p-3 rounded-xl space-y-1 ${
                              isAdmin
                                ? "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                                : "bg-white dark:bg-brand-dark-card border border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>{m.senderName}</span>
                              <span className="text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin Reply Input */}
                    <form onSubmit={handleAdminTicketReply} className="space-y-2 pt-2 border-t border-border/60">
                      <textarea
                        rows={3}
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="Type authoritative response from Support HQ..."
                        className="w-full bg-white dark:bg-brand-dark-card border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald resize-none"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`https://wa.me/254${selectedTicket.userPhone.replace(/^(\+254|0)/, "")}?text=Hello%20${encodeURIComponent(selectedTicket.userName)},%20this%20is%20VendLex%20Admin%20regarding%20Support%20Ticket%20${selectedTicket.ticketNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp User</span>
                        </a>

                        <button
                          type="submit"
                          disabled={isSendingReply || !adminReplyText.trim()}
                          className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold text-xs py-1.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingReply ? "Sending..." : "Send Reply"}</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Select a support ticket from the list to view the conversation and reply.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: MERCHANT KYC QUEUE                                         */}
        {/* ================================================================= */}
        {activeTab === "kyc" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-emerald" />
                  <span>Merchant Onboarding &amp; Business KYC Moderation</span>
                </h3>
                <p className="text-xs text-muted-foreground">Review CR12 certificates, national IDs, and approve verified merchant accreditation.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                {kycs.filter((k) => k.status === "PENDING").length} Pending Review
              </span>
            </div>

            {loadingKycs ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading KYC queue...</div>
            ) : kycs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No KYC applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {kycs.map((kyc) => (
                  <div
                    key={kyc.id}
                    className="p-5 rounded-2xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-emerald/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{kyc.bizName}</h4>
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono">{kyc.regNumber}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Signatory: <strong className="text-foreground">{kyc.ownerName}</strong> (ID: {kyc.nationalId}) • {kyc.county}
                      </p>
                      {kyc.docUrl && (
                        <div className="text-[11px] text-brand-emerald font-semibold flex items-center gap-1 mt-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Attached Document: {kyc.docUrl}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {kyc.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleKycAction(kyc.id, "APPROVED")}
                            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Merchant</span>
                          </button>
                          <button
                            onClick={() => handleKycAction(kyc.id, "REJECTED")}
                            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          kyc.status === "APPROVED" ? "bg-emerald-100 text-brand-emerald" : "bg-red-100 text-brand-red"
                        }`}>
                          {kyc.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ORDERS & ESCROW VAULT LOGISTICS                            */}
        {/* ================================================================= */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-emerald" />
                  <span>Orders Logistics &amp; Lipa na M-Pesa Escrow Releases</span>
                </h3>
                <p className="text-xs text-muted-foreground">Manage order states, assign courier tracking, and release escrow funds to merchants.</p>
              </div>
              <button
                onClick={fetchOrders}
                className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {loadingOrders ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No orders placed on the platform yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Order Ref</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items &amp; Store</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">M-Pesa Receipt</th>
                      <th className="pb-3">Tracking Waybill</th>
                      <th className="pb-3">Escrow Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-foreground">{ord.orderNumber}</td>
                        <td className="py-3.5">
                          <div className="font-bold text-foreground">{ord.customerName}</div>
                          <div className="text-[10px] text-muted-foreground">{ord.county} • {ord.customerPhone}</div>
                        </td>
                        <td className="py-3.5">
                          <div className="font-bold text-foreground line-clamp-1 max-w-xs">
                            {ord.items?.map((i) => `${i.productTitle} (${i.quantity}x)`).join(", ") || "Product items"}
                          </div>
                          <div className="text-[10px] text-brand-emerald font-semibold">{ord.sellerName}</div>
                        </td>
                        <td className="py-3.5 font-black text-brand-emerald">{formatKSh(ord.totalAmount)}</td>
                        <td className="py-3.5 font-mono font-bold text-foreground">{ord.mpesaReceipt || "—"}</td>
                        <td className="py-3.5 font-mono text-muted-foreground">{ord.courierTracking || "Pending Dispatch"}</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-100 text-brand-emerald"
                              : ord.status === "DISPATCHED"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "PAID"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ord.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === "PAID" && (
                              <button
                                onClick={() => handleOrderStatusAction(ord.id, "DISPATCHED")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2.5 rounded-lg text-[11px] shadow-sm"
                              >
                                Mark Dispatched
                              </button>
                            )}

                            {ord.status === "DISPATCHED" && (
                              <button
                                onClick={() => handleOrderStatusAction(ord.id, "DELIVERED")}
                                className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-1 px-2.5 rounded-lg text-[11px] shadow-sm"
                              >
                                Release Escrow Payout
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: DISPUTES & FRAUD MEDIATION                                 */}
        {/* ================================================================= */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-brand-red" />
                    <span>Customer Dispute Center &amp; Heuristic Risk Monitor</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Mediate buyer disputes, unfreeze or release contested escrow funds, and log resolutions.
                  </p>
                </div>
                <button
                  onClick={fetchDisputes}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDisputes ? "animate-spin" : ""}`} />
                  <span>Refresh Disputes</span>
                </button>
              </div>

              {loadingDisputes ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Loading disputes...</div>
              ) : disputes.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  No active disputes filed on the platform. All transactions in good standing!
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((d) => (
                    <div
                      key={d.id}
                      className="p-5 rounded-2xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                            {d.id}
                          </span>
                          <span className="font-bold text-xs text-foreground">Order Ref: {d.orderNumber}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            d.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {d.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-xs text-foreground font-semibold">
                          Reason: {d.reason} • Amount: <span className="text-brand-emerald font-black">{formatKSh(d.amount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                        <div className="text-[11px] text-muted-foreground">
                          Buyer: <strong>{d.customerName}</strong> ({d.customerPhone}) • Seller: <strong>{d.sellerName}</strong>
                        </div>
                        {d.resolutionNotes && (
                          <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl mt-1">
                            Resolution: {d.resolutionNotes}
                          </div>
                        )}
                      </div>

                      {d.status !== "RESOLVED" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleResolveDispute(d.id, "RESOLVED", "Mediation completed. Escrow released to rightful party.")}
                            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve Dispute</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: SAFARICOM DARAJA 2.0 API & LIVE M-PESA LEDGER              */}
        {/* ================================================================= */}
        {activeTab === "daraja" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Daraja Config (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Key className="w-4 h-4 text-brand-emerald" />
                    <span>Daraja 2.0 Paybill / Till Integration</span>
                  </h3>
                  <span className="bg-emerald-100 text-brand-emerald font-black text-[10px] px-2.5 py-0.5 rounded-full">
                    LIVE DARAJA 2.0
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Business Shortcode</label>
                    <input
                      type="text"
                      value={shortcode}
                      onChange={(e) => setShortcode(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 font-mono font-bold text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Consumer Key</label>
                      <input
                        type="text"
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl p-2.5 font-mono text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-foreground mb-1">Passkey</label>
                      <input
                        type="password"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-xl p-2.5 font-mono text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Webhook URL Endpoint</label>
                    <input
                      type="text"
                      readOnly
                      value={callbackUrl}
                      className="w-full bg-muted border border-border rounded-xl p-2.5 font-mono text-muted-foreground select-all"
                    />
                  </div>
                </div>
              </div>

              {/* STK Push Test Tool (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Real STK Push Testing Tool</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Send a real PIN prompt to your Safaricom mobile device.</p>
                </div>

                <form onSubmit={handleTestSTK} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Safaricom Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 font-mono font-bold text-foreground focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Amount (KSh) *</label>
                    <input
                      type="number"
                      required
                      value={testAmount}
                      onChange={(e) => setTestAmount(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-xl p-2.5 font-bold text-brand-emerald focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTriggeringSTK}
                    className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTriggeringSTK ? "Triggering STK..." : `Push M-Pesa PIN Prompt (KSh ${testAmount})`}</span>
                  </button>
                </form>

                {stkFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    stkFeedback.startsWith("✓") ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-red-50 text-red-900 border border-red-200"
                  }`}>
                    {stkFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* Live Ledger Table */}
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-emerald" />
                  <span>Real-Time M-Pesa Transaction Ledger</span>
                </h3>
                <button
                  onClick={fetchTransactions}
                  className="px-3 py-1 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTxns ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  No M-Pesa transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">M-Pesa Receipt</th>
                        <th className="pb-3">Payer / Store</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-muted/20">
                          <td className="py-3 font-mono font-bold text-foreground">{t.mpesaReceiptNumber || t.checkoutRequestId.slice(0, 16)}</td>
                          <td className="py-3 font-semibold text-foreground">{t.sellerName || "Direct Settlement"}</td>
                          <td className="py-3 font-mono text-muted-foreground">{t.phoneNumber}</td>
                          <td className="py-3 font-black text-brand-emerald">{formatKSh(t.amount)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === "COMPLETED" ? "bg-emerald-100 text-brand-emerald" : "bg-amber-100 text-amber-800"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground text-[11px]">{t.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: VERIFIED PLATFORM DOCUMENTS & CERTIFICATES                 */}
        {/* ================================================================= */}
        {activeTab === "documents" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-emerald" />
                  <span>Authoritative Verifiable Document Ledger</span>
                </h3>
                <p className="text-xs text-muted-foreground">Inspect official receipts, invoices, statements, and merchant accreditation certificates.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="Search by ID, order or store..."
                  className="w-full bg-muted/40 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                />
              </div>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No documents matching search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Document ID</th>
                      <th className="pb-3">Type &amp; Title</th>
                      <th className="pb-3">Owner / Seller</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Issued Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/20">
                        <td className="py-3.5 font-mono font-bold text-brand-emerald">{doc.publicDocumentId}</td>
                        <td className="py-3.5">
                          <div className="font-bold text-foreground">{doc.title}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{doc.documentType.replace(/_/g, " ")}</div>
                        </td>
                        <td className="py-3.5">
                          <div className="font-semibold text-foreground">{doc.ownerName}</div>
                          <div className="text-[10px] text-muted-foreground">{doc.sellerName}</div>
                        </td>
                        <td className="py-3.5 font-bold text-foreground">{doc.amount > 0 ? formatKSh(doc.amount) : "—"}</td>
                        <td className="py-3.5 text-muted-foreground">{new Date(doc.issuedAt).toLocaleDateString("en-KE")}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            doc.status === "VALID" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                          <a
                            href={`/api/documents/${doc.publicDocumentId}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-[11px] shadow-2xs"
                          >
                            <span>PDF</span>
                          </a>
                          <Link
                            href={`/verify/${doc.publicDocumentId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/70 text-foreground font-semibold text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Verify</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: AI 47-COUNTY DEMAND HEATMAP                                */}
        {/* ================================================================= */}
        {activeTab === "heatmap" && <AICountyHeatmap />}

        {/* ================================================================= */}
        {/* TAB 9: SPONSORED BUSINESS ADVERTISEMENTS                          */}
        {/* ================================================================= */}
        {activeTab === "advertisements" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-brand-emerald" />
                  <span>Sponsored Business Advertisements Moderation</span>
                </h3>
                <p className="text-xs text-muted-foreground">Review KES 1,020 / 30-day business promotion listings submitted across Kenya.</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={adFilterStatus}
                  onChange={(e) => setAdFilterStatus(e.target.value)}
                  className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
                >
                  <option value="ALL">All Ad Statuses</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="ACTIVE">Active (Live)</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <button
                  onClick={fetchAdvertisements}
                  className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAds ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {loadingAds ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading advertisements...</div>
            ) : filteredAds.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No advertisements found matching filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-5 rounded-2xl border border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-emerald/40 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {ad.mediaUrl && (
                        <img
                          src={ad.mediaUrl}
                          alt={ad.title}
                          className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{ad.title}</h4>
                          <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald font-black px-2 py-0.5 rounded">
                            {formatKSh(ad.amount || 1020)} • 30 Days
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{ad.description}</p>
                        <div className="text-[11px] text-muted-foreground">
                          Advertiser: <strong>{ad.businessName || ad.advertiserName}</strong> • Phone: <strong>{ad.contactPhone || ad.advertiserPhone}</strong> • County: <strong>{ad.county}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ad.status === "PENDING_REVIEW" ? (
                        <>
                          <button
                            onClick={() => handleApproveAd(ad.id)}
                            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Ad</span>
                          </button>
                          <button
                            onClick={() => handleRejectAd(ad.id, "Did not meet advertising guidelines.")}
                            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          ad.status === "ACTIVE" ? "bg-emerald-100 text-brand-emerald" : "bg-red-100 text-brand-red"
                        }`}>
                          {ad.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
