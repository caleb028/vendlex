"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Sparkles,
  Building2,
  Tag,
  Layers,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { AICountyHeatmap } from "@/components/ai/ai-county-heatmap";
import {
  ServerSupportTicket,
  ServerAdvertisement,
  ServerOrder,
  ServerKYC,
  ServerDispute,
  ServerAuditLog,
} from "@/lib/server-db/types";
import { VendLexDocument } from "@/lib/documents/types";
import { KENYAN_COUNTIES, CATEGORIES, Product } from "@/lib/data/kenya-data";

export type AdminProduct = Product & { stock?: number; badge?: string; image?: string };

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

interface AdminBusiness {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  category: string;
  county: string;
  town: string;
  isVerified: boolean;
  kycStatus: string;
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  avatar: string;
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/admin");
  };

  // Tab State
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "businesses"
    | "products"
    | "orders"
    | "kyc"
    | "disputes"
    | "support"
    | "daraja"
    | "advertisements"
    | "documents"
    | "heatmap"
    | "security"
  >("overview");

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Real-Time Heartbeat & Live Stream State
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentLiveEvents, setRecentLiveEvents] = useState<ServerAuditLog[]>([]);

  // Platform Metrics
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
    systemHealth: "100% OPERATIONAL (LIVE)",
  });

  // Database Collections
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [bizSearchQuery, setBizSearchQuery] = useState("");
  const [bizCountyFilter, setBizCountyFilter] = useState("ALL");

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [prodSearchQuery, setProdSearchQuery] = useState("");
  const [prodCategoryFilter, setProdCategoryFilter] = useState("ALL");

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

  // Modals State: Businesses
  const [isAddBizModalOpen, setIsAddBizModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<AdminBusiness | null>(null);
  const [newBizForm, setNewBizForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    category: "General Retail",
    county: "Nairobi",
    town: "Nairobi CBD",
    isVerified: true,
    password: "Vendor@2026",
  });

  // Modals State: Products
  const [isAddProdModalOpen, setIsAddProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<AdminProduct | null>(null);
  const [newProdForm, setNewProdForm] = useState({
    title: "",
    businessName: "Nairobi Tech Hub",
    category: "Electronics & Computing",
    price: 1500,
    stock: 20,
    county: "Nairobi",
    town: "Nairobi CBD",
    description: "Verified official item with Lipa na M-Pesa escrow protection.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
    badge: "VERIFIED",
  });

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passChangeSuccess, setPassChangeSuccess] = useState<string | null>(null);
  const [passChangeError, setPassChangeError] = useState<string | null>(null);

  // Dispute & KYC Action Modals
  const [resolvingDispute, setResolvingDispute] = useState<{ id: string; action: "RESOLVE" | "REJECT" } | null>(null);
  const [disputeNotes, setDisputeNotes] = useState("");

  // =========================================================================
  // REAL-TIME HEARTBEAT POLLING (No manual browser refresh required)
  // =========================================================================
  const pollLiveData = async () => {
    try {
      const res = await fetch("/api/admin/live");
      const data = await res.json();
      if (data.success) {
        setIsLiveConnected(true);
        setLastHeartbeat(new Date());
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentOrders) setOrders(data.recentOrders);
        if (data.recentAuditLogs) setRecentLiveEvents(data.recentAuditLogs);
        if (data.recentTransactions) setTransactions(data.recentTransactions);
      }
    } catch (err) {
      console.warn("[Admin Live Stream Poll Warning]:", err);
      setIsLiveConnected(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    pollLiveData();
    fetchBusinesses();
    fetchProducts();
    fetchKycs();
    fetchDisputes();
    fetchTickets();
    fetchAdvertisements();
    fetchDocuments();

    // 3.5s real-time live heartbeat interval
    const interval = setInterval(() => {
      pollLiveData();
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Fetchers
  const fetchBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const res = await fetch("/api/admin/businesses");
      const data = await res.json();
      if (data.success && data.businesses) {
        setBusinesses(data.businesses);
      }
    } catch (e) {
      console.warn("Businesses fetch error:", e);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn("Products fetch error:", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchKycs = async () => {
    try {
      setLoadingKycs(true);
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.success && data.kycs) {
        setKycs(data.kycs);
      }
    } catch (e) {
      console.warn("KYC fetch error:", e);
    } finally {
      setLoadingKycs(false);
    }
  };

  const fetchDisputes = async () => {
    try {
      setLoadingDisputes(true);
      const res = await fetch("/api/disputes");
      const data = await res.json();
      if (data.success && data.disputes) {
        setDisputes(data.disputes);
      }
    } catch (e) {
      console.warn("Disputes fetch error:", e);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      if (data.success && data.tickets) {
        setSupportTickets(data.tickets);
      }
    } catch (e) {
      console.warn("Tickets fetch error:", e);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchAdvertisements = async () => {
    try {
      setLoadingAds(true);
      const res = await fetch("/api/admin/advertisements");
      const data = await res.json();
      if (data.success && data.advertisements) {
        setAdvertisements(data.advertisements);
      }
    } catch (e) {
      console.warn("Advertisements fetch error:", e);
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.warn("Documents fetch error:", e);
    }
  };

  // Helper notification toaster
  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 5000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 4500);
    }
  };

  // =========================================================================
  // BUSINESSES MANAGEMENT ACTIONS
  // =========================================================================
  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBizForm),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || "Business created successfully.");
        setIsAddBizModalOpen(false);
        setNewBizForm({
          name: "",
          businessName: "",
          email: "",
          phone: "",
          category: "General Retail",
          county: "Nairobi",
          town: "Nairobi CBD",
          isVerified: true,
          password: "Vendor@2026",
        });
        fetchBusinesses();
        pollLiveData();
      } else {
        showFeedback(data.error || "Failed to create business.", true);
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to create business.", true);
    }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBiz),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || "Business updated.");
        setEditingBiz(null);
        fetchBusinesses();
        pollLiveData();
      } else {
        showFeedback(data.error || "Failed to update business.", true);
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to update business.", true);
    }
  };

  const handleToggleBizVerification = async (biz: AdminBusiness) => {
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: biz.id, isVerified: !biz.isVerified }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Verified status for "${biz.businessName}" set to ${!biz.isVerified ? "VERIFIED" : "UNVERIFIED"}.`);
        fetchBusinesses();
        pollLiveData();
      }
    } catch (err: any) {
      showFeedback("Verification update error.", true);
    }
  };

  const handleToggleBizStatus = async (biz: AdminBusiness) => {
    const newStatus = biz.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: biz.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Business "${biz.businessName}" is now ${newStatus}.`);
        fetchBusinesses();
        pollLiveData();
      }
    } catch (err: any) {
      showFeedback("Status update error.", true);
    }
  };

  const handleDeleteBusiness = async (bizId: string, bizName: string) => {
    if (!confirm(`Are you sure you want to permanently disable/delete "${bizName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/businesses?id=${bizId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || `Business "${bizName}" removed.`);
        fetchBusinesses();
        pollLiveData();
      } else {
        showFeedback(data.error || "Failed to delete business.", true);
      }
    } catch (err: any) {
      showFeedback("Delete error.", true);
    }
  };

  // =========================================================================
  // PRODUCTS MANAGEMENT ACTIONS
  // =========================================================================
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProdForm),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || "Product created successfully.");
        setIsAddProdModalOpen(false);
        setNewProdForm({
          title: "",
          businessName: "Nairobi Tech Hub",
          category: "Electronics & Computing",
          price: 1500,
          stock: 20,
          county: "Nairobi",
          town: "Nairobi CBD",
          description: "Verified official item with Lipa na M-Pesa escrow protection.",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
          badge: "VERIFIED",
        });
        fetchProducts();
        pollLiveData();
      } else {
        showFeedback(data.error || "Failed to add product.", true);
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to add product.", true);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProd.id,
          title: editingProd.title,
          price: editingProd.price,
          stock: editingProd.stockCount ?? editingProd.stock ?? 0,
          category: editingProd.category,
          county: editingProd.county,
          town: editingProd.town,
          badge: editingProd.badge,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || "Product updated.");
        setEditingProd(null);
        fetchProducts();
        pollLiveData();
      } else {
        showFeedback(data.error || "Failed to update product.", true);
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to update product.", true);
    }
  };

  const handleDeleteProduct = async (prodId: string, prodTitle: string) => {
    if (!confirm(`Are you sure you want to remove product "${prodTitle}" from marketplace?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${prodId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || `Product "${prodTitle}" deleted.`);
        fetchProducts();
        pollLiveData();
      } else {
        showFeedback(data.error || "Failed to delete product.", true);
      }
    } catch (err: any) {
      showFeedback("Delete product error.", true);
    }
  };

  // =========================================================================
  // PASSWORD CHANGE ACTION
  // =========================================================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeSuccess(null);
    setPassChangeError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassChangeError("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPassChangeError("New password must be at least 8 characters long.");
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (data.success) {
        setPassChangeSuccess(data.message || "Administrator password changed successfully.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showFeedback("Admin password updated successfully.");
      } else {
        setPassChangeError(data.error || "Failed to change password.");
      }
    } catch (err: any) {
      setPassChangeError(err?.message || "Internal network error.");
    } finally {
      setIsChangingPass(false);
    }
  };

  // =========================================================================
  // OTHER ACTIONS: KYC, Orders, Disputes, STK Push
  // =========================================================================
  const handleApproveKYC = async (kycId: string, userId: string) => {
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycId, userId, action: "APPROVE", verifiedBy: user?.name || "Caleb Ngiciri" }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Merchant verified! Badge awarded.`);
        fetchKycs();
        fetchBusinesses();
        pollLiveData();
      }
    } catch (err) {
      showFeedback("KYC approval failed.", true);
    }
  };

  const handleRejectKYC = async (kycId: string, userId: string) => {
    const reason = prompt("Please enter the reason for rejection (this will be sent to the merchant):");
    if (!reason) return;
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycId, userId, action: "REJECT", reason, verifiedBy: user?.name || "Caleb Ngiciri" }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`KYC rejected. Merchant notified.`);
        fetchKycs();
        pollLiveData();
      }
    } catch (err) {
      showFeedback("KYC rejection failed.", true);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(`Order status updated to ${newStatus}.`);
        pollLiveData();
      }
    } catch (err) {
      showFeedback("Order status update failed.", true);
    }
  };

  const handleTriggerSTKTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsTriggeringSTK(true);
      setStkFeedback(null);
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: testPhone,
          amount: Number(testAmount),
          accountReference: "ADMIN_DIAGNOSTIC",
          transactionDesc: "VendLex Live STK Diagnostic Probe",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStkFeedback(`✓ STK Prompt sent to ${testPhone}. Check phone for PIN prompt.`);
        pollLiveData();
      } else {
        setStkFeedback(`✗ STK Error: ${data.error || data.errorMessage}`);
      }
    } catch (err: any) {
      setStkFeedback(`✗ Network Error: ${err?.message}`);
    } finally {
      setIsTriggeringSTK(false);
    }
  };

  // Filtered lists
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        b.businessName.toLowerCase().includes(bizSearchQuery.toLowerCase()) ||
        b.name.toLowerCase().includes(bizSearchQuery.toLowerCase()) ||
        b.email.toLowerCase().includes(bizSearchQuery.toLowerCase()) ||
        b.phone.includes(bizSearchQuery) ||
        b.county.toLowerCase().includes(bizSearchQuery.toLowerCase());
      const matchesCounty = bizCountyFilter === "ALL" || b.county.toLowerCase() === bizCountyFilter.toLowerCase();
      return matchesSearch && matchesCounty;
    });
  }, [businesses, bizSearchQuery, bizCountyFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
        p.businessName.toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
        p.county.toLowerCase().includes(prodSearchQuery.toLowerCase());
      const matchesCat = prodCategoryFilter === "ALL" || p.category.toLowerCase() === prodCategoryFilter.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [products, prodSearchQuery, prodCategoryFilter]);

  return (
    <div className="min-h-screen bg-brand-charcoal text-white selection:bg-brand-emerald selection:text-white flex flex-col font-sans">
      {/* 1. TOP ISOLATED COMMAND CENTER HEADER */}
      <header className="sticky top-0 z-40 bg-brand-charcoal/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-xl shadow-md border border-white/80 shrink-0">
              <img
                src="/logo/vendlex-horizontal.png"
                alt="VendLex Admin Command Hub"
                className="h-8 sm:h-9 w-auto max-w-[200px] object-contain"
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>MASTER COMMAND HUB</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30">
                  ROOT
                </span>
              </span>
              <span className="text-[11px] text-gray-400">All 47 Counties • Live Operations</span>
            </div>
          </Link>
        </div>

        {/* Center Live Real-Time Heartbeat Badge */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
              ⚡ LIVE CONNECTED
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            Synced {lastHeartbeat.toLocaleTimeString()}
          </span>
          <button
            onClick={() => pollLiveData()}
            title="Force immediate heartbeat poll"
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
          </Link>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl">
            <div className="w-7 h-7 rounded-xl bg-brand-emerald flex items-center justify-center text-xs font-black text-white">
              {user?.name?.[0] || "C"}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <p className="font-extrabold text-white truncate max-w-[120px]">{user?.name || "Caleb Ngiciri"}</p>
              <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider">SUPER ADMIN</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors"
            title="Sign Out of Admin Command Center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. REAL-TIME LIVE ACTIVITY TICKER BAR */}
      <div className="bg-[#051610] border-b border-emerald-950 px-4 sm:px-8 py-2 flex items-center justify-between text-xs overflow-x-auto gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            <Radio className="w-3 h-3 animate-pulse text-amber-400" />
            <span>LIVE STREAM</span>
          </span>
          <p className="text-gray-300 text-xs truncate max-w-xl">
            {recentLiveEvents.length > 0
              ? `${recentLiveEvents[0].action}: ${recentLiveEvents[0].details || "Live operation processed"} (${new Date(recentLiveEvents[0].timestamp).toLocaleTimeString()})`
              : "System operational across all 47 Kenyan Counties. Escrow vault active."}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-[11px] text-gray-400">
          <span>
            Vault: <strong className="text-emerald-400">{formatKSh(metrics.escrowInVault)}</strong>
          </span>
          <span>
            Merchants: <strong className="text-white">{metrics.activeSellers}</strong>
          </span>
          <span>
            Orders: <strong className="text-amber-300">{metrics.totalOrders}</strong>
          </span>
        </div>
      </div>

      {/* Feedback Banners */}
      {actionSuccess && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {actionError && (
        <div className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* 3. MAIN DASHBOARD BODY: TABS & CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin border-b border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "overview"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>Overview &amp; Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab("businesses")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "businesses"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Store className="w-4 h-4 text-amber-300" />
            <span>Businesses &amp; Merchants</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">{businesses.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "products"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package className="w-4 h-4 text-amber-300" />
            <span>Products &amp; Catalog</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">{products.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "orders"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Truck className="w-4 h-4 text-amber-300" />
            <span>Live Orders</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "kyc"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>KYC Verification</span>
            {metrics.pendingKYCsCount > 0 && (
              <span className="text-[10px] bg-amber-400 text-brand-charcoal font-black px-1.5 py-0.2 rounded-full">
                {metrics.pendingKYCsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "disputes"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Disputes &amp; Escrow</span>
            {metrics.openDisputesCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full">
                {metrics.openDisputesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("daraja")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "daraja"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span>Daraja M-Pesa</span>
          </button>

          <button
            onClick={() => setActiveTab("advertisements")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "advertisements"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Megaphone className="w-4 h-4 text-amber-300" />
            <span>County Ads</span>
          </button>

          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "heatmap"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>47 Counties Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "security"
                ? "bg-brand-emerald text-white shadow-lg font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW & REAL-TIME PLATFORM METRICS */}
        {/* ================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold uppercase tracking-wider">Gross Platform GMV</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {formatKSh(metrics.totalGMV)}
                </div>
                <p className="text-xs text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Total Gross Merchandise Volume</span>
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold uppercase tracking-wider">Escrow in Vault</span>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {formatKSh(metrics.escrowInVault)}
                </div>
                <p className="text-xs text-amber-200">Secured pending buyer delivery confirmation</p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold uppercase tracking-wider">Active Merchants</span>
                  <Store className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {metrics.activeSellers}
                </div>
                <p className="text-xs text-gray-400">{metrics.verifiedMerchants} verified across 47 counties</p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold uppercase tracking-wider">Catalog Products</span>
                  <Package className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {metrics.totalProducts}
                </div>
                <p className="text-xs text-gray-400">{metrics.totalOrders} total platform orders</p>
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setActiveTab("businesses");
                  setIsAddBizModalOpen(true);
                }}
                className="p-5 rounded-2xl bg-gradient-to-br from-brand-emerald/30 to-emerald-900/40 border border-brand-emerald/40 hover:border-brand-emerald text-left space-y-2 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-emerald text-white flex items-center justify-center font-black">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Add New Business
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Onboard a new seller or merchant without writing any code.
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveTab("products");
                  setIsAddProdModalOpen(true);
                }}
                className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-950/40 border border-amber-500/40 hover:border-amber-400 text-left space-y-2 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-gold text-brand-charcoal flex items-center justify-center font-black">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Add New Product
                </h4>
                <p className="text-xs text-amber-100 leading-relaxed">
                  Publish a verified product into the public catalog instantly.
                </p>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-950/40 border border-blue-500/40 hover:border-blue-400 text-left space-y-2 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Change Password &amp; Security
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Update administrator credentials and inspect real-time audit logs.
                </p>
              </button>
            </div>

            {/* Live Activity Log Table */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Real-Time Platform Operations Feed</span>
                  </h3>
                  <p className="text-xs text-gray-400">Live operational events stream automatically without page reload</p>
                </div>
                <button
                  onClick={() => pollLiveData()}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Now</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-gray-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Details</th>
                      <th className="py-2.5 px-3">Resource</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentLiveEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono text-gray-400 whitespace-nowrap">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono text-[10px]">
                            {ev.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-200 max-w-md truncate">{ev.details}</td>
                        <td className="py-3 px-3 font-mono text-gray-400 text-[11px]">{ev.resource}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ev.status === "SUCCESS"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: BUSINESSES & MERCHANTS MANAGEMENT (VISUAL NO-CODE) */}
        {/* ================================================================= */}
        {activeTab === "businesses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-300" />
                  <span>Businesses &amp; Merchants Directory</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Manage all registered merchants across all 47 counties. Add, edit, verify, or disable with 1 click.
                </p>
              </div>

              <button
                onClick={() => setIsAddBizModalOpen(true)}
                className="bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Business</span>
              </button>
            </div>

            {/* Search & County Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bizSearchQuery}
                  onChange={(e) => setBizSearchQuery(e.target.value)}
                  placeholder="Search by business name, owner name, email, phone, or county..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={bizCountyFilter}
                  onChange={(e) => setBizCountyFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="ALL" className="bg-brand-charcoal text-white">All 47 Counties</option>
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c} className="bg-brand-charcoal text-white">
                      {c} County
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Businesses Table */}
            <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-white/10 text-gray-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4">Business Details</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Catalog &amp; Sales</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBusinesses.map((biz) => (
                      <tr key={biz.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center font-bold text-amber-300 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-black text-white text-sm flex items-center gap-1.5">
                                <span>{biz.businessName}</span>
                                {biz.isVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400">{biz.name} • {biz.email}</p>
                              <p className="text-[10px] text-emerald-300 font-mono">{biz.phone}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{biz.county}</span>
                            </span>
                            <span className="text-[11px] text-gray-400 block">{biz.town}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleBizVerification(biz)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
                              biz.isVerified
                                ? "bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30"
                                : "bg-gray-500/20 text-gray-300 border-gray-500/40 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40"
                            }`}
                            title="Click to toggle verified merchant badge"
                          >
                            {biz.isVerified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-amber-300" />
                                <span>VERIFIED BADGE</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>UNVERIFIED</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="text-white font-mono font-bold block">{biz.productsCount} Products</span>
                            <span className="text-emerald-400 font-mono text-[11px] block">{formatKSh(biz.totalRevenue)} GMV</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleBizStatus(biz)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                              biz.status === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300"
                                : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-300"
                            }`}
                            title="Click to toggle active / suspended status"
                          >
                            {biz.status}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                          <button
                            onClick={() => setEditingBiz(biz)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Edit Business Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(biz.id, biz.businessName)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                            title="Delete Business"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: PRODUCTS & CATALOG MANAGEMENT (VISUAL NO-CODE) */}
        {/* ================================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-300" />
                  <span>Marketplace Product Catalog</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Manage all products listed across Kenyan storefronts. Adjust stock, update prices, or remove items with 1 click.
                </p>
              </div>

              <button
                onClick={() => setIsAddProdModalOpen(true)}
                className="bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={prodSearchQuery}
                  onChange={(e) => setProdSearchQuery(e.target.value)}
                  placeholder="Search products by title, store name, category, or county..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={prodCategoryFilter}
                  onChange={(e) => setProdCategoryFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                >
                  <option value="ALL" className="bg-brand-charcoal text-white">All Product Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-brand-charcoal text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-white/10 text-gray-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Store / Seller</th>
                      <th className="py-3 px-4">Price (KES)</th>
                      <th className="py-3 px-4">Inventory Stock</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image || prod.images?.[0] || "/placeholder.png"}
                              alt={prod.title}
                              className="w-12 h-12 rounded-xl object-cover bg-white/10 shrink-0 border border-white/10"
                            />
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-white text-xs truncate max-w-xs">{prod.title}</div>
                              <span className="text-[10px] text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.2 rounded-md">
                                {prod.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">{prod.businessName}</span>
                            <span className="text-[10px] text-gray-400 block">{prod.county}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-emerald-400 text-sm">
                          {formatKSh(prod.price)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono ${
                              (prod.stockCount ?? prod.stock ?? 0) > 0
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}
                          >
                            {(prod.stockCount ?? prod.stock ?? 0)} in stock
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                            {prod.badge || "STANDARD"}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                          <button
                            onClick={() => setEditingProd(prod)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Edit Price & Stock"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.title)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SECURITY & CHANGE PASSWORD */}
        {/* ================================================================= */}
        {activeTab === "security" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-emerald/20 border border-brand-emerald/40 flex items-center justify-center text-amber-300">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Administrator Password &amp; Credentials</h3>
                  <p className="text-xs text-gray-400">
                    Update your master administrator password. Secured with 64-byte Scrypt cryptographic hashing.
                  </p>
                </div>
              </div>

              {passChangeSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{passChangeSuccess}</span>
                </div>
              )}

              {passChangeError && (
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{passChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Current Administrator Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">New Password (Min 8 Characters)</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">Confirm New Password</label>
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    {isChangingPass ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Hashing &amp; Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 text-amber-300" />
                        <span>Update Administrator Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: ORDERS & ESCROW MANAGEMENT */}
        {/* ================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-300" />
                <span>Live Escrow &amp; Order Pipeline</span>
              </h2>
              <span className="text-xs font-mono text-emerald-300">
                {orders.length} total orders
              </span>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 border-b border-white/10 text-gray-400 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items / Store</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status Transition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{ord.orderNumber}</td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">{ord.customerName}</span>
                            <span className="text-[11px] text-gray-400 block">{ord.customerPhone}</span>
                            <span className="text-[10px] text-emerald-300 font-mono">{ord.county || "Kenya"} • {ord.town || "Town"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">{ord.sellerName || "Marketplace Store"}</span>
                            <span className="text-gray-400 text-[11px] block">{ord.items?.length || 1} line item(s)</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                          {formatKSh(ord.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                          >
                            <option value="PENDING_PAYMENT" className="bg-brand-charcoal text-white">PENDING_PAYMENT</option>
                            <option value="PAID" className="bg-brand-charcoal text-white">PAID (Escrow Vault)</option>
                            <option value="PROCESSING" className="bg-brand-charcoal text-white">PROCESSING</option>
                            <option value="READY_FOR_DISPATCH" className="bg-brand-charcoal text-white">READY_FOR_DISPATCH</option>
                            <option value="DISPATCHED" className="bg-brand-charcoal text-white">DISPATCHED (In Transit)</option>
                            <option value="DELIVERED" className="bg-brand-charcoal text-white">DELIVERED (Released)</option>
                            <option value="CANCELLED" className="bg-brand-charcoal text-white">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: KYC VERIFICATION */}
        {/* ================================================================= */}
        {activeTab === "kyc" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span>Merchant KYC &amp; Verification Moderation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kycs.map((k) => (
                <div key={k.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-base text-white">{k.bizName}</h4>
                      <p className="text-xs text-gray-400">Owner: {k.ownerName} • Reg: {k.regNumber}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        k.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : k.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>

                  <div className="p-3 bg-white/5 rounded-2xl text-xs space-y-1 font-mono text-gray-300">
                    <div>Business Reg #: {k.regNumber || "BN-2026-98104"}</div>
                    <div>National ID: {k.nationalId || "34891024"}</div>
                    <div>County Base: {k.county || "Nairobi"}</div>
                  </div>

                  {k.status === "PENDING" && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleApproveKYC(k.id, k.userId)}
                        className="flex-1 bg-brand-emerald hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Check className="w-4 h-4 text-amber-300" />
                        <span>Approve Merchant</span>
                      </button>
                      <button
                        onClick={() => handleRejectKYC(k.id, k.userId)}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject with Note</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: DARAJA M-PESA GATEWAY & LIVE STK TESTER */}
        {/* ================================================================= */}
        {activeTab === "daraja" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-300" />
              <span>Safaricom Daraja Lipa na M-Pesa STK Gateway</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STK Push Test Probe */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider text-amber-300">
                  Instant STK Push Diagnostic Probe
                </h3>
                <p className="text-xs text-gray-300">
                  Trigger a live Lipa na M-Pesa STK prompt to verify sandbox or production Daraja credentials.
                </p>

                {stkFeedback && (
                  <div className="p-3.5 rounded-2xl bg-white/10 text-xs font-mono text-emerald-300 border border-white/10">
                    {stkFeedback}
                  </div>
                )}

                <form onSubmit={handleTriggerSTKTest} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Kenyan Phone Number</label>
                    <input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Amount (KES)</label>
                    <input
                      type="number"
                      value={testAmount}
                      onChange={(e) => setTestAmount(e.target.value)}
                      min="1"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isTriggeringSTK}
                    className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>{isTriggeringSTK ? "Triggering STK Prompt..." : "Send Test STK Push"}</span>
                  </button>
                </form>
              </div>

              {/* Gateway Ledger */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider text-emerald-400">
                  Live Gateway Configuration
                </h3>
                <div className="p-4 bg-black/40 rounded-2xl font-mono text-xs text-gray-300 space-y-2">
                  <div>Shortcode: <span className="text-amber-300">{shortcode}</span></div>
                  <div>Passkey: <span className="text-gray-400">••••••••••••••••••••••••</span></div>
                  <div>Callback: <span className="text-emerald-400 truncate block">{callbackUrl}</span></div>
                  <div>Status: <span className="text-emerald-400 font-bold">ACTIVE &amp; READY</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: 47 COUNTIES HEATMAP */}
        {/* ================================================================= */}
        {activeTab === "heatmap" && (
          <div className="space-y-6 animate-fadeIn">
            <AICountyHeatmap />
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: ADD NEW BUSINESS */}
      {/* ===================================================================== */}
      {isAddBizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-brand-charcoal border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-300" />
                <span>Add New Business</span>
              </h3>
              <button onClick={() => setIsAddBizModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Business Store Name</label>
                <input
                  type="text"
                  value={newBizForm.businessName}
                  onChange={(e) => setNewBizForm({ ...newBizForm, businessName: e.target.value })}
                  placeholder="e.g. Mombasa Spices Hub"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Owner Legal Name</label>
                <input
                  type="text"
                  value={newBizForm.name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, name: e.target.value })}
                  placeholder="e.g. Amina Hassan"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newBizForm.email}
                    onChange={(e) => setNewBizForm({ ...newBizForm, email: e.target.value })}
                    placeholder="amina@store.ke"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newBizForm.phone}
                    onChange={(e) => setNewBizForm({ ...newBizForm, phone: e.target.value })}
                    placeholder="07XXXXXXXX"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">County</label>
                  <select
                    value={newBizForm.county}
                    onChange={(e) => setNewBizForm({ ...newBizForm, county: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white"
                  >
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c} className="bg-brand-charcoal text-white">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Category</label>
                  <select
                    value={newBizForm.category}
                    onChange={(e) => setNewBizForm({ ...newBizForm, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name} className="bg-brand-charcoal text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bizVerified"
                  checked={newBizForm.isVerified}
                  onChange={(e) => setNewBizForm({ ...newBizForm, isVerified: e.target.checked })}
                  className="rounded text-brand-emerald focus:ring-brand-emerald"
                />
                <label htmlFor="bizVerified" className="text-gray-300 font-bold">
                  Award Verified Merchant Badge immediately
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Create &amp; Publish Business</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD NEW PRODUCT */}
      {/* ===================================================================== */}
      {isAddProdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-brand-charcoal border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-300" />
                <span>Add Product to Catalog</span>
              </h3>
              <button onClick={() => setIsAddProdModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProdForm.title}
                  onChange={(e) => setNewProdForm({ ...newProdForm, title: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Price (KES)</label>
                  <input
                    type="number"
                    value={newProdForm.price}
                    onChange={(e) => setNewProdForm({ ...newProdForm, price: Number(e.target.value) })}
                    min="1"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProdForm.stock}
                    onChange={(e) => setNewProdForm({ ...newProdForm, stock: Number(e.target.value) })}
                    min="0"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Category</label>
                  <select
                    value={newProdForm.category}
                    onChange={(e) => setNewProdForm({ ...newProdForm, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name} className="bg-brand-charcoal text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">County Origin</label>
                  <select
                    value={newProdForm.county}
                    onChange={(e) => setNewProdForm({ ...newProdForm, county: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white"
                  >
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c} className="bg-brand-charcoal text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProdForm.image}
                  onChange={(e) => setNewProdForm({ ...newProdForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Short Description</label>
                <textarea
                  value={newProdForm.description}
                  onChange={(e) => setNewProdForm({ ...newProdForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Publish Product to Marketplace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ===================================================================== */}
      {editingProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-brand-charcoal border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-300" />
                <span>Quick Price &amp; Stock Editor</span>
              </h3>
              <button onClick={() => setEditingProd(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={editingProd.title}
                  onChange={(e) => setEditingProd({ ...editingProd, title: e.target.value })}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Price (KES)</label>
                  <input
                    type="number"
                    value={editingProd.price}
                    onChange={(e) => setEditingProd({ ...editingProd, price: Number(e.target.value) })}
                    min="1"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProd.stockCount ?? editingProd.stock ?? 0}
                    onChange={(e) => setEditingProd({ ...editingProd, stockCount: Number(e.target.value), stock: Number(e.target.value) })}
                    min="0"
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
