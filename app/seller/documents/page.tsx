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
  TrendingUp,
  Award,
  Calendar,
  Filter,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function SellerDocumentCenterPage() {
  const { user, role } = useAuth();
  const [documents, setDocuments] = useState<VendLexDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportToast, setReportToast] = useState("");

  const TABS = [
    { label: "All Records", value: "ALL" },
    { label: "Invoices", value: "INVOICE" },
    { label: "Financial Statements", value: "FINANCIAL_STATEMENT" },
    { label: "Sales Reports", value: "SALES_REPORT" },
    { label: "Merchant Certificates", value: "SELLER_CERTIFICATE" },
  ];

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        role: "SELLER",
        businessName: user?.businessName || "Nairobi Tech Hub",
        name: user?.name || "Alex Mwangi",
      });
      const res = await fetch(`/api/documents?${query.toString()}`);
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to load seller documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user, role]);

  const stats = useMemo(() => {
    return {
      invoices: documents.filter((d) => d.documentType === "INVOICE").length,
      statements: documents.filter((d) => d.documentType === "FINANCIAL_STATEMENT").length,
      reports: documents.filter((d) => d.documentType === "SALES_REPORT").length,
      certificates: documents.filter((d) => d.documentType === "SELLER_CERTIFICATE").length,
    };
  }, [documents]);

  const handleGenerateReport = (period: string) => {
    setReportGenerating(true);
    setTimeout(() => {
      setReportGenerating(false);
      setReportToast(`Generated official ${period} Sales & Revenue Report with VendLex Platform Stamp.`);
      fetchDocs();
      setTimeout(() => setReportToast(""), 4000);
    }, 1500);
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedTab !== "ALL" && doc.documentType !== selectedTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = doc.publicDocumentId.toLowerCase().includes(q);
        const mTitle = doc.title.toLowerCase().includes(q);
        const mOwner = doc.ownerName.toLowerCase().includes(q);
        if (!mId && !mTitle && !mOwner) return false;
      }
      return true;
    });
  }, [documents, selectedTab, searchQuery]);

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              <Award className="w-3.5 h-3.5" />
              <span>Merchant Document &amp; Compliance Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Seller Document Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Generate stamped invoices, monthly ledger statements, tax-ready sales reports, and download your official VendLex Verified Seller Certificate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleGenerateReport("August 2026")}
              disabled={reportGenerating}
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{reportGenerating ? "Generating..." : "Generate Monthly Report"}</span>
            </button>
            <Link
              href="/seller/dashboard"
              className="px-4 py-2.5 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border transition-colors"
            >
              Seller Dashboard
            </Link>
          </div>
        </div>

        {/* Toast Notification */}
        {reportToast && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            <span>{reportToast}</span>
          </div>
        )}

        {/* 4 Summary Metric Cards per Section 49 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Issued Invoices</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{stats.invoices}</div>
            <span className="text-[10px] text-muted-foreground">B2B &amp; customer orders</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Statements</span>
              <TrendingUp className="w-4 h-4 text-brand-emerald" />
            </div>
            <div className="text-2xl font-black text-foreground">{stats.statements}</div>
            <span className="text-[10px] text-muted-foreground">Monthly ledger summaries</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Sales Reports</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{stats.reports}</div>
            <span className="text-[10px] text-muted-foreground">Automated aggregations</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold">Certificate</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-black text-brand-emerald flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED MERCHANT</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Official Platform Stamp</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTab === tab.value
                    ? "bg-brand-emerald text-white shadow-xs"
                    : "bg-muted/40 hover:bg-muted/70 text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or title..."
              className="w-full bg-muted/40 dark:bg-brand-dark-bg border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-4">Document Details</th>
                  <th className="p-4">Recipient / Subject</th>
                  <th className="p-4">Issued Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-foreground">{doc.title}</div>
                      <div className="font-mono text-[11px] font-black text-brand-emerald">
                        {doc.publicDocumentId}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="font-semibold text-foreground">{doc.ownerName}</div>
                      {doc.orderNumber && (
                        <div className="font-mono text-[10px] text-muted-foreground">
                          Order: {doc.orderNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">
                      {new Date(doc.issuedAt).toLocaleDateString("en-KE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {doc.amount > 0 ? formatKSh(doc.amount) : "—"}
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <a
                        href={`/api/documents/${doc.publicDocumentId}/download`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-[11px] transition-colors shadow-2xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                      <Link
                        href={`/verify/${doc.publicDocumentId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/70 text-foreground font-semibold text-[11px] transition-colors"
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
        </div>
      </div>
    </div>
  );
}
