"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/store/auth-store";
import { VendLexDocument } from "@/lib/documents/types";
import { formatKSh } from "@/lib/utils";
import {
  Wrench,
  Download,
  ShieldCheck,
  Award,
  ExternalLink,
  Plus,
  FileText,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function ServiceProviderDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VendLexDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const query = new URLSearchParams({
          role: "ADMIN", // Service provider documents view
          search: "Plumber",
        });
        const res = await fetch(`/api/documents?${query.toString()}`);
        const data = await res.json();
        if (data.success && data.documents) {
          setDocuments(data.documents);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-emerald text-xs font-black uppercase tracking-wider border border-emerald-200">
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              <span>Prosper Service Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Service Provider Documents
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Official certificates, customer quotes, and booking confirmations for certified Kenyan trade specialists.
            </p>
          </div>

          <Link
            href="/services"
            className="px-4 py-2.5 bg-muted/60 hover:bg-muted text-foreground font-bold text-xs rounded-xl border border-border transition-colors self-start"
          >
            Services Marketplace
          </Link>
        </div>

        {/* Certificate Hero Card */}
        <div className="bg-gradient-to-r from-brand-charcoal via-gray-900 to-brand-emerald-dark rounded-3xl p-6 sm:p-8 text-white border border-brand-emerald/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase">
              <Award className="w-4 h-4" />
              <span>Official Accreditation</span>
            </div>
            <h2 className="text-xl font-black">
              Service Provider Verification Certificate
            </h2>
            <p className="text-xs text-gray-300 max-w-md">
              Validates your verified credentials and trade background across all 47 counties with an immutable QR verification code.
            </p>
          </div>

          <a
            href="/api/documents/VLX-CER-2026-000055/download"
            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate (PDF)</span>
          </a>
        </div>

        {/* Records List */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground">Recent Quotes &amp; Confirmations</h3>

          {loading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">Loading service records...</div>
          ) : (
            <div className="divide-y divide-border/60">
              {documents.map((doc) => (
                <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block">{doc.title}</span>
                    <span className="text-[11px] font-mono text-brand-emerald font-black block">
                      {doc.publicDocumentId}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Issued: {new Date(doc.issuedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${doc.publicDocumentId}/download`}
                      className="px-3 py-1.5 bg-brand-emerald text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                    <Link
                      href={`/verify/${doc.publicDocumentId}`}
                      target="_blank"
                      className="p-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
