"use client";

import React, { useState, useEffect } from "react";
import { AdminMarketingNav } from "@/components/admin/marketing-nav";
import {
  Plug,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Lock,
  Radio,
  FileCode,
} from "lucide-react";

interface ConnectionItem {
  id: string;
  provider: string;
  status: "CONNECTED" | "CONFIGURATION_REQUIRED" | "ERROR" | "DISCONNECTED";
  lastSync?: string;
  error?: string;
  config?: Record<string, any>;
}

export default function AdminMarketingIntegrationsPage() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing/integrations");
      const data = await res.json();
      if (data.success && data.connections) {
        setConnections(data.connections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleRunHealthCheck = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/marketing/integrations", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setTestResult("All configured provider endpoints responded normally.");
        fetchIntegrations();
      } else {
        setTestResult(`Health Check Alert: ${data.error || "Some endpoints failed"}`);
      }
    } catch (err: any) {
      setTestResult(`Health Check Error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://vendlex.co.ke";

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <AdminMarketingNav />

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-brand-dark-card border border-border p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plug className="w-4 h-4 text-brand-emerald" />
              Ad Network Server-Side Integrations
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage API tokens, Conversions API (CAPI), and live product feed syndications.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunHealthCheck}
            disabled={testing || loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            <span>{testing ? "Running Health Diagnostics..." : "Run Provider Health Check"}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>{testResult}</span>
          </div>
        )}

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Google Ads & Measurement Protocol */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Google Ads &amp; GA4</h3>
                    <p className="text-[11px] text-muted-foreground">Measurement Protocol Server Dispatch</p>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-brand-emerald border border-emerald-200">
                Server-Side Active
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Dispatches offline purchase conversions to Google Ads when Kenyan orders are confirmed via Safaricom Lipa na M-Pesa. Prevents ad attribution loss from iOS Safari blocking or browser adblockers.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">GA4 Measurement ID</span>
                  <span className="text-foreground text-xs">{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-VENDLEX-KE-01"}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* 2. Google Merchant Center Feed */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Google Merchant Center</h3>
                    <p className="text-[11px] text-muted-foreground">Shopping RSS 2.0 XML Catalog Feed</p>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-brand-emerald border border-emerald-200">
                Feed Online
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time XML product feed with Kenyan Shilling (KES) pricing, stock status, GTIN/MPN identifiers, and high-resolution product photography.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Public XML URL</span>
                  <span className="text-foreground text-xs truncate">{origin}/api/marketing/feeds/google.xml</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${origin}/api/marketing/feeds/google.xml`, "google_feed")}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Copy Google Feed URL"
                >
                  {copiedKey === "google_feed" ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Meta Conversions API (CAPI) */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Meta Ads Conversions API</h3>
                    <p className="text-[11px] text-muted-foreground">Direct Graph API v19.0 Event Bridge</p>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-brand-emerald border border-emerald-200">
                CAPI Server Active
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Streams SHA-256 hashed customer identifiers (email, phone formatted with 254 prefix) and verified purchase value directly to Meta servers with event deduplication.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Meta Pixel / Dataset ID</span>
                  <span className="text-foreground text-xs">{process.env.META_PIXEL_ID || "984210948123984"}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* 4. Meta Catalog CSV Feed */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Meta Product Catalog Feed</h3>
                    <p className="text-[11px] text-muted-foreground">Commerce Manager CSV Feed Endpoint</p>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-brand-emerald border border-emerald-200">
                Feed Online
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated data feed for Facebook &amp; Instagram Dynamic Product Ads (DPA) featuring automated Kenyan category mapping, stock updates, and merchant seller tags.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs font-mono">
              <div className="p-2.5 bg-muted/40 rounded-xl flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Public CSV URL</span>
                  <span className="text-foreground text-xs truncate">{origin}/api/marketing/feeds/meta.csv</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${origin}/api/marketing/feeds/meta.csv`, "meta_feed")}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Copy Meta Feed URL"
                >
                  {copiedKey === "meta_feed" ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variable Configuration Guide */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-brand-emerald" />
            <h3 className="text-sm font-bold text-foreground">
              Production Credentials (.env.local) Configuration Reference
            </h3>
          </div>

          <p className="text-xs text-muted-foreground">
            To connect live production Google Ads and Meta API credentials, set the following environment variables on the hosting server:
          </p>

          <pre className="p-4 bg-muted/60 text-foreground font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-border">
{`# Google Ads & Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
GA4_API_SECRET="your_ga4_measurement_protocol_api_secret"
GOOGLE_ADS_CUSTOMER_ID="123-456-7890"

# Meta Ads Conversions API (CAPI) & Pixel
NEXT_PUBLIC_META_PIXEL_ID="123456789012345"
META_ACCESS_TOKEN="EAAB..."
META_PIXEL_ID="123456789012345"
META_TEST_EVENT_CODE="" # optional for test events

# Safaricom Daraja M-Pesa (Auto-dispatches verified purchase conversions)
MPESA_CALLBACK_URL="https://vendlex.co.ke/api/mpesa/callback"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
