"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store/auth-store";
import { VendLexDocument } from "@/lib/documents/types";
import { formatKSh } from "@/lib/utils";
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  ShieldCheck,
  Eye,
  ExternalLink,
  Filter,
  Calendar,
  Package,
  Building2,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";

export default function CustomerDocumentCenterPage() {
  const { user, role } = useAuth();
  const [documents, setDocuments] = useState<VendLexDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<VendLexDocument | null>(null);

  const TABS = [
    { label: "All Documents", value: "ALL" },
    { label: "Order Receipts", value: "RECEIPT" },
    { label: "Tax Invoices", value: "INVOICE" },
    { label: "Payments", value: "PAYMENT_CONFIRMATION" },
    { label: "Deliveries", value: "DELIVERY_CONFIRMATION" },
    { label: "Warranties", value: "WARRANTY" },
    { label: "Refunds", value: "REFUND_CONFIRMATION" },
  ];

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        role: role || "CUSTOMER",
        name: user?.name || "David Ochieng", // Default to demo user if not logged in
        phone: user?.phone || "0722 123 456",
        userId: user?.id || "user-david",
      });
      const res = await fetch(`/api/documents?${query.toString()}`);
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user, role]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedType !== "ALL" && doc.documentType !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = doc.publicDocumentId.toLowerCase().includes(q);
        const mTitle = doc.title.toLowerCase().includes(q);
        const mOrder = doc.orderNumber?.toLowerCase().includes(q);
        const mSeller = doc.sellerName.toLowerCase().includes(q);
        if (!mId && !mTitle && !mOrder && !mSeller) return false;
      }
      return true;
    });
  }, [documents, selectedType, searchQuery]);

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Documents Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              My Official Documents
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Access, download, and verify your official receipts, invoices, payment confirmations, and warranties with the cryptographic VendLex platform stamp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/dashboard"
              className="px-4 py-2.5 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border transition-colors"
            >
              Customer Dashboard
            </Link>
            <button
              onClick={fetchDocs}
              className="p-2.5 bg-muted/60 hover:bg-muted text-foreground rounded-xl border border-border transition-colors"
              title="Refresh documents"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Horizontal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedType === tab.value
                      ? "bg-brand-emerald text-white shadow-xs"
                      : "bg-muted/40 hover:bg-muted/70 text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Order # or Seller..."
                className="w-full bg-muted/40 dark:bg-brand-dark-bg border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>
        </div>

        {/* Documents Grid / List */}
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-muted-foreground">
            Loading your verified documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No documents found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When you make purchases, complete deliveries, or request service quotes on VendLex, official verifiable documents will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Type & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald border border-emerald-200 dark:border-emerald-800">
                      {doc.documentType.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        doc.status === "VALID"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.status === "REVOKED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  {/* Title & Document ID */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-foreground line-clamp-1">
                      {doc.title}
                    </h3>
                    <span className="text-xs font-mono font-black text-brand-emerald block">
                      {doc.publicDocumentId}
                    </span>
                  </div>

                  {/* Metadata rows */}
                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                    {doc.orderNumber && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          <span>Order:</span>
                        </span>
                        <strong className="text-foreground font-mono">{doc.orderNumber}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Seller:</span>
                      </span>
                      <span className="text-foreground font-medium truncate max-w-[140px]">
                        {doc.sellerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Issued:</span>
                      </span>
                      <span className="text-foreground font-medium">
                        {new Date(doc.issuedAt).toLocaleDateString("en-KE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {doc.amount > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="font-bold text-foreground">Total:</span>
                        <strong className="text-brand-emerald font-black">
                          {formatKSh(doc.amount)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 p-2 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <a
                    href={`/api/documents/${doc.publicDocumentId}/download`}
                    className="flex-1 p-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  <Link
                    href={`/verify/${doc.publicDocumentId}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Open public verification page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-pop-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-emerald uppercase">Document Preview</span>
                <h3 className="text-sm font-black text-foreground">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-muted/40 font-mono">
                <span className="text-muted-foreground">Identifier:</span>
                <strong className="text-foreground">{previewDoc.publicDocumentId}</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                <span className="text-muted-foreground">Verification Code:</span>
                <strong className="font-mono text-brand-emerald">{previewDoc.verificationCode}</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                <span className="text-muted-foreground">Issued Date:</span>
                <span>{new Date(previewDoc.issuedAt).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                <span className="font-bold text-foreground">Items Summary:</span>
                {previewDoc.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-muted-foreground text-[11px]">
                    <span>{i.qty}x {i.description}</span>
                    <span>{formatKSh(i.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`/api/documents/${previewDoc.publicDocumentId}/download`}
                className="flex-1 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </a>
              <Link
                href={`/verify/${previewDoc.publicDocumentId}`}
                target="_blank"
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span>Verify</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
