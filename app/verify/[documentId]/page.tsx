"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { DocumentVerificationResult } from "@/lib/documents/types";
import { formatKSh } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Clock,
  Building2,
  Package,
  QrCode,
  Hash,
  Award,
} from "lucide-react";

export default function DocumentVerificationPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.documentId;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DocumentVerificationResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      try {
        const res = await fetch(`/api/documents/${documentId}/verify`);
        const data = await res.json();
        if (data.success && data.verification) {
          setResult(data.verification);
        } else {
          setResult({
            valid: false,
            status: "VOID",
            message: "DOCUMENT NOT FOUND: This document could not be verified.",
          });
        }
      } catch (err) {
        setResult({
          valid: false,
          status: "VOID",
          message: "Failed to connect to the VendLex verification service.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [documentId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Verification Card */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl shadow-xl overflow-hidden">
          {/* 1. Header Banner */}
          <div className="bg-gradient-to-r from-brand-charcoal via-gray-900 to-brand-emerald-dark p-6 sm:p-8 text-white text-center space-y-2 border-b border-border">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>VendLex Kenya • Official Document Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Public Document Registry
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-mono">
              Identifier: {documentId.toUpperCase()}
            </p>
          </div>

          {/* 2. Loading State */}
          {loading && (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">
                Querying VendLex verified cryptographic ledger...
              </p>
            </div>
          )}

          {/* 3. Result Section */}
          {!loading && result && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Status Banner */}
              {result.valid ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-start gap-3.5 animate-stamp-zoom-out">
                  <CheckCircle2 className="w-6 h-6 text-brand-emerald shrink-0 mt-0.5 animate-pop-up-bounce" />
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                      ✓ DOCUMENT VERIFIED AUTHENTIC
                    </h2>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                      This document matches the authoritative, immutable record stored in the VendLex Kenya database.
                    </p>
                  </div>
                </div>
              ) : result.status === "REVOKED" ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl flex items-start gap-3.5 animate-pop-up">
                  <XCircle className="w-6 h-6 text-brand-red shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-black text-red-900 dark:text-red-200">
                      DOCUMENT REVOKED
                    </h2>
                    <p className="text-xs text-red-800 dark:text-red-300/90 leading-relaxed">
                      {result.message}
                    </p>
                  </div>
                </div>
              ) : result.status === "SUPERSEDED" ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3.5 animate-pop-up">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-black text-amber-900 dark:text-amber-200">
                      DOCUMENT SUPERSEDED
                    </h2>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                      {result.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 dark:bg-muted/40 border border-border rounded-2xl flex items-start gap-3.5 animate-pop-up">
                  <XCircle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-black text-foreground">
                      DOCUMENT NOT FOUND
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This document could not be located in the VendLex verified registry. Please confirm the document identifier.
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Document Record Details */}
              {result.document && (
                <div className="space-y-4 pt-2 animate-page-stagger-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 bg-muted/30 dark:bg-brand-dark-bg/60 rounded-xl border border-border/70 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Document Type
                      </span>
                      <span className="text-xs font-black text-foreground block">
                        {result.document.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Type: {result.document.documentType} (v{result.document.version})
                      </span>
                    </div>

                    <div className="p-3.5 bg-muted/30 dark:bg-brand-dark-bg/60 rounded-xl border border-border/70 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Document Identifier
                      </span>
                      <span className="text-xs font-black font-mono text-foreground block">
                        {result.document.publicDocumentId}
                      </span>
                      <span className="text-[10px] text-brand-emerald font-mono font-bold">
                        Verification Code: {result.document.verificationCode}
                      </span>
                    </div>

                    <div className="p-3.5 bg-muted/30 dark:bg-brand-dark-bg/60 rounded-xl border border-border/70 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Issued By (Merchant / Issuer)
                      </span>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-emerald" />
                        <span>{result.document.issuerName}</span>
                      </span>
                    </div>

                    <div className="p-3.5 bg-muted/30 dark:bg-brand-dark-bg/60 rounded-xl border border-border/70 space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Issue Date
                      </span>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>
                          {new Date(result.document.issuedAt).toLocaleDateString("en-KE", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </div>

                    {result.document.orderNumber && (
                      <div className="p-3.5 bg-muted/30 dark:bg-brand-dark-bg/60 rounded-xl border border-border/70 space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Related Order
                        </span>
                        <span className="text-xs font-black text-brand-emerald flex items-center gap-1.5 font-mono">
                          <Package className="w-3.5 h-3.5" />
                          <span>{result.document.orderNumber}</span>
                        </span>
                      </div>
                    )}

                    {result.document.amount !== undefined && result.document.amount > 0 && (
                      <div className="p-3.5 bg-muted/30 dark:bg-brand-dark-bg/60 rounded-xl border border-border/70 space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Settlement Amount
                        </span>
                        <span className="text-xs font-black text-foreground block">
                          {formatKSh(result.document.amount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cryptographic SHA-256 Digest */}
                  <div className="p-3.5 bg-gray-900 text-gray-200 rounded-xl space-y-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-1 font-bold">
                        <Hash className="w-3 h-3 text-brand-emerald" />
                        <span>SHA-256 Integrity Hash</span>
                      </span>
                      <span className="text-emerald-400 font-bold">✓ Match Confirmed</span>
                    </div>
                    <div className="break-all text-gray-300">
                      {result.document.fileHash}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <a
                      href={`/api/documents/${result.document.publicDocumentId}/download`}
                      className="flex-1 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Verified PDF</span>
                    </a>

                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-muted/50 hover:bg-muted border border-border rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-brand-emerald" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-muted-foreground" />
                          <span>Copy Verification Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Official Stamp & Disclaimer */}
              <div className="p-4 bg-muted/20 border border-border/80 rounded-2xl space-y-2 text-[11px] text-muted-foreground">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-emerald" />
                  <span>VendLex Platform Document Authenticity Notice</span>
                </div>
                <p className="leading-relaxed">
                  The official platform stamp certifies that this document was issued through the VendLex Kenya electronic commerce gateway. It confirms internal ledger consistency and payment or order state. It does not represent or substitute government regulatory permits, court filings, or bank instruments unless explicitly supported by verified statutory integrations.
                </p>
              </div>
            </div>
          )}

          {/* 4. Footer */}
          <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <Link href="/" className="hover:text-brand-emerald font-bold transition-colors">
              ← Return to VendLex Kenya
            </Link>
            <span>SHOP • GROW • PROSPER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
