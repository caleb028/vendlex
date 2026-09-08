"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { VendLexDocument, DocumentAuditEntry } from "@/lib/documents/types";
import { formatKSh } from "@/lib/utils";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ExternalLink,
  RotateCcw,
  Clock,
  Filter,
  RefreshCw,
  FileText,
  User,
  Building2,
  X,
} from "lucide-react";

export default function AdminDocumentCenterPage() {
  const [documents, setDocuments] = useState<VendLexDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<DocumentAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Revoke Modal State
  const [revokeTarget, setRevokeTarget] = useState<VendLexDocument | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Audit Modal State
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<VendLexDocument | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents?role=ADMIN");
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
  }, []);

  const stats = useMemo(() => {
    return {
      total: documents.length,
      valid: documents.filter((d) => d.status === "VALID").length,
      revoked: documents.filter((d) => d.status === "REVOKED").length,
      superseded: documents.filter((d) => d.status === "SUPERSEDED").length,
    };
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (typeFilter !== "ALL" && d.documentType !== typeFilter) return false;
      if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = d.publicDocumentId.toLowerCase().includes(q);
        const mTitle = d.title.toLowerCase().includes(q);
        const mOrder = d.orderNumber?.toLowerCase().includes(q);
        const mSeller = d.sellerName.toLowerCase().includes(q);
        const mOwner = d.ownerName.toLowerCase().includes(q);
        if (!mId && !mTitle && !mOrder && !mSeller && !mOwner) return false;
      }
      return true;
    });
  }, [documents, typeFilter, statusFilter, searchQuery]);

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeTarget || !revokeReason.trim() || revokeLoading) return;

    setRevokeLoading(true);
    try {
      const res = await fetch(`/api/documents/${revokeTarget.publicDocumentId}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: revokeReason.trim(),
          adminName: "Chief Compliance Officer",
          role: "ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRevokeTarget(null);
        setRevokeReason("");
        fetchDocs();
      }
    } catch (err) {
      console.error("Revocation failed:", err);
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleOpenAudit = async (doc: VendLexDocument) => {
    setSelectedAuditDoc(doc);
    try {
      const res = await fetch(`/api/documents/${doc.publicDocumentId}?role=ADMIN`);
      const data = await res.json();
      if (data.success && data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-brand-red text-xs font-black uppercase tracking-wider border border-red-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Administration &amp; Trust Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Document Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor issued platform documents, audit cryptographic signatures, enforce compliance, and execute document revocations with immutable logging.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin"
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl border border-border"
            >
              Admin Dashboard
            </Link>
            <button
              onClick={fetchDocs}
              className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl border border-border"
              title="Refresh records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 4 Stats Cards per Section 27 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-xs font-bold text-muted-foreground">Total Documents</span>
            <div className="text-2xl font-black text-foreground">{stats.total}</div>
            <span className="text-[10px] text-muted-foreground">Registry records</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-xs font-bold text-emerald-600">Valid &amp; Authentic</span>
            <div className="text-2xl font-black text-emerald-600">{stats.valid}</div>
            <span className="text-[10px] text-muted-foreground">Active verifiable state</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-xs font-bold text-red-600">Revoked Documents</span>
            <div className="text-2xl font-black text-brand-red">{stats.revoked}</div>
            <span className="text-[10px] text-muted-foreground">Fraud &amp; dispute actions</span>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-xs font-bold text-amber-600">Superseded</span>
            <div className="text-2xl font-black text-amber-600">{stats.superseded}</div>
            <span className="text-[10px] text-muted-foreground">Replaced with newer versions</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Order, Seller, Owner..."
              className="w-full bg-muted/40 dark:bg-brand-dark-bg border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-border bg-muted/40 text-xs font-semibold"
            >
              <option value="ALL">All Document Types</option>
              <option value="RECEIPT">Order Receipts</option>
              <option value="INVOICE">Tax Invoices</option>
              <option value="PAYMENT_CONFIRMATION">Payment Confirmations</option>
              <option value="DELIVERY_CONFIRMATION">Delivery Confirmations</option>
              <option value="WARRANTY">Warranties</option>
              <option value="FINANCIAL_STATEMENT">Financial Statements</option>
              <option value="SELLER_CERTIFICATE">Merchant Certificates</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-border bg-muted/40 text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALID">VALID</option>
              <option value="REVOKED">REVOKED</option>
              <option value="SUPERSEDED">SUPERSEDED</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-4">Document Details</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Issuer / Store</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Admin Actions</th>
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
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Hash: {doc.fileHash.substring(0, 16)}...
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="font-semibold text-foreground">{doc.ownerName}</div>
                      {doc.ownerPhone && <div className="text-[10px]">{doc.ownerPhone}</div>}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="font-semibold text-foreground">{doc.sellerName}</div>
                      {doc.orderNumber && (
                        <div className="font-mono text-[10px] text-brand-emerald">
                          {doc.orderNumber}
                        </div>
                      )}
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
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <a
                        href={`/api/documents/${doc.publicDocumentId}/download`}
                        className="p-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg inline-flex"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenAudit(doc)}
                        className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-[11px] font-bold"
                      >
                        Audit
                      </button>
                      <Link
                        href={`/verify/${doc.publicDocumentId}`}
                        target="_blank"
                        className="p-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg inline-flex"
                        title="Verify Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      {doc.status === "VALID" && (
                        <button
                          onClick={() => {
                            setRevokeTarget(doc);
                            setRevokeReason("");
                          }}
                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-brand-red rounded-lg text-[11px] font-black transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleRevokeSubmit}
            className="bg-white dark:bg-brand-dark-card border border-red-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-pop-up"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-brand-red">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-black">Revoke Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently invalidate <strong className="text-foreground">{revokeTarget.publicDocumentId}</strong>? Anyone scanning this document&apos;s QR code will immediately see that the document is REVOKED.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Mandatory Revocation Reason:
              </label>
              <textarea
                required
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Transaction refunded via M-Pesa dispute, incorrect billing address, or duplicate order entry."
                className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="flex-1 py-2.5 bg-muted rounded-xl text-xs font-bold text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={revokeLoading || !revokeReason.trim()}
                className="flex-1 py-2.5 bg-brand-red hover:bg-red-700 text-white rounded-xl text-xs font-black transition-colors"
              >
                {revokeLoading ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Audit Logs Modal */}
      {selectedAuditDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-pop-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-emerald uppercase">Audit Trail</span>
                <h3 className="text-sm font-black text-foreground">
                  History: {selectedAuditDoc.publicDocumentId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditDoc(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 scrollbar-thin">
              {auditLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No audit entries found.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-muted/30 rounded-xl border border-border/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-brand-emerald">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">By: {log.performedBy}</div>
                    {log.details && <div className="text-foreground text-[11px] font-medium">{log.details}</div>}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedAuditDoc(null)}
              className="w-full py-2.5 bg-muted rounded-xl text-xs font-bold text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
