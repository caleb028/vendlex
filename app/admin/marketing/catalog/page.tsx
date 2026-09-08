"use client";

import React, { useState, useEffect } from "react";
import { AdminMarketingNav } from "@/components/admin/marketing-nav";
import {
  ShoppingBag,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { ProductFeedSyncSummary } from "@/lib/marketing/types";

export default function AdminMarketingCatalogPage() {
  const [data, setData] = useState<{
    summary: ProductFeedSyncSummary;
    sampleProducts?: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing/catalog");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    try {
      const res = await fetch("/api/admin/marketing/catalog", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setSyncSuccess("Product catalog feeds refreshed & re-indexed successfully!");
        setTimeout(() => setSyncSuccess(null), 3500);
        fetchCatalogData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://vendlex.vercel.app";

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <AdminMarketingNav />

        {/* Top Sync Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-brand-dark-card border border-border p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-emerald" />
              Product Catalog Feeds &amp; Syndication Health
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live Google Shopping RSS 2.0 XML and Meta Catalog CSV feeds for dynamic Kenyan advertising.
            </p>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing || loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Re-indexing Feeds..." : "Sync & Re-index Feeds"}</span>
          </button>
        </div>

        {syncSuccess && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncSuccess}</span>
          </div>
        )}

        {/* Feed Eligibility Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Catalog Items
            </span>
            <div className="text-2xl font-black text-foreground">
              {data?.summary ? data.summary.totalProducts : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground">Platform products in database</p>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
              Eligible for Ad Feeds
            </span>
            <div className="text-2xl font-black text-brand-emerald">
              {data?.summary ? data.summary.eligibleProducts : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground">Valid price, in-stock &amp; verified photos</p>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Excluded Items
            </span>
            <div className="text-2xl font-black text-amber-600">
              {data?.summary ? data.summary.rejectedProducts : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground">Out of stock, zero price, or drafts</p>
          </div>
        </div>

        {/* Live Feed Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Shopping Feed */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-foreground">Google Merchant Shopping XML Feed</h3>
              </div>
              <a
                href="/api/marketing/feeds/google.xml"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Preview XML <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-between font-mono text-xs">
              <span className="truncate mr-2 text-foreground">{origin}/api/marketing/feeds/google.xml</span>
              <button
                type="button"
                onClick={() => copyToClipboard(`${origin}/api/marketing/feeds/google.xml`, "google_feed")}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Copy Google XML Feed URL"
              >
                {copiedKey === "google_feed" ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Submit this URL in Google Merchant Center under <strong>Feeds → Add Feed → Scheduled fetch</strong>.
            </p>
          </div>

          {/* Meta Catalog Feed */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold text-foreground">Meta Commerce Manager Catalog CSV Feed</h3>
              </div>
              <a
                href="/api/marketing/feeds/meta.csv"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-purple-600 hover:underline inline-flex items-center gap-1"
              >
                Preview CSV <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-between font-mono text-xs">
              <span className="truncate mr-2 text-foreground">{origin}/api/marketing/feeds/meta.csv</span>
              <button
                type="button"
                onClick={() => copyToClipboard(`${origin}/api/marketing/feeds/meta.csv`, "meta_feed")}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Copy Meta CSV Feed URL"
              >
                {copiedKey === "meta_feed" ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Submit this URL in Meta Commerce Manager under <strong>Catalog → Data Sources → Data Feed</strong>.
            </p>
          </div>
        </div>

        {/* Exclusion Reasons & Feed Errors */}
        {data?.summary?.errors && data.summary.errors.length > 0 && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Feed Inspection &amp; Exclusion Log
            </h3>
            <div className="divide-y divide-border/60 text-xs">
              {data.summary.errors.map((err, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <span className="font-mono text-muted-foreground">{err.productId || "CATALOG"}</span>
                  <span className="text-amber-700 dark:text-amber-400">{err.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
