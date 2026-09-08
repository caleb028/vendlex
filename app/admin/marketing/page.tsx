"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminMarketingNav } from "@/components/admin/marketing-nav";
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";
import {
  MarketingAnalyticsSummary,
  AdvertisingConnection,
  ProductFeedSyncSummary,
  MarketingCampaign,
  MarketingEvent,
} from "@/lib/marketing/types";
import { AttributionEngine } from "@/lib/marketing/attribution";

export default function AdminMarketingOverviewPage() {
  const [summary, setSummary] = useState<MarketingAnalyticsSummary | null>(null);
  const [connections, setConnections] = useState<AdvertisingConnection[]>([]);
  const [feedSync, setFeedSync] = useState<ProductFeedSyncSummary | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<MarketingCampaign[]>([]);
  const [recentEvents, setRecentEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing");
      const json = await res.json();
      if (json.success) {
        setSummary(json.summary);
        setConnections(json.connections || []);
        setFeedSync(json.feedSync || null);
        setRecentCampaigns(json.recentCampaigns || []);
        setRecentEvents(json.recentEvents || []);
      }
    } catch (err) {
      console.error("Failed to load marketing data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalConversions = summary?.totalConversions || 0;
  const totalRevenue = summary?.attributedRevenue || 0;
  const totalSpend = summary?.totalSpend || 0;
  const activeCampaignsCount = recentCampaigns.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <AdminMarketingNav />

        {/* Top Action Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Real-Time Marketing Intelligence &amp; Performance
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-brand-dark-card hover:bg-muted text-xs font-bold text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh KPIs</span>
          </button>
        </div>

        {/* High-Level Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Attributed Revenue</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-brand-emerald">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {formatKSh(totalRevenue)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              100% verified via Lipa na M-Pesa order callbacks
            </p>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Verified Conversions</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {totalConversions}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Purchase orders &amp; merchant onboarding leads
            </p>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {activeCampaignsCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Platform Shopping, Search &amp; Meta Ad initiatives
            </p>
          </div>

          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Blended ROAS</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">
              {summary?.blendedRoas ? `${summary.blendedRoas.toFixed(1)}x` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Return on advertising spend across all networks
            </p>
          </div>
        </div>

        {/* Integration Connection Status Overview */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-emerald" />
              Ad Network Live Connection Status
            </h2>
            <Link
              href="/admin/marketing/integrations"
              className="text-xs font-bold text-brand-emerald hover:underline inline-flex items-center gap-1"
            >
              Configure API Keys <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {connections.length > 0 ? (
              connections.map((conn) => {
                const isHealthy = conn.status === "CONNECTED";
                const isConfigReq = conn.status === "CONFIGURATION_REQUIRED";
                return (
                  <div
                    key={conn.provider}
                    className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {conn.provider === "GOOGLE" ? "Google Ads & Shopping" : "Meta Ads & Catalog (CAPI)"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHealthy
                            ? "bg-emerald-100 text-brand-emerald"
                            : isConfigReq
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-brand-red"
                        }`}
                      >
                        {isHealthy
                          ? "Active"
                          : isConfigReq
                          ? "Config Required"
                          : "Disconnected"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {conn.lastSyncAt
                        ? `Last sync: ${new Date(conn.lastSyncAt).toLocaleTimeString()}`
                        : isHealthy
                        ? "Server Bridge Active"
                        : "Configure credentials in .env.local"}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-xs text-muted-foreground py-2">
                Loading ad connections...
              </div>
            )}
          </div>
        </div>

        {/* Channel Breakdown & County Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Channel Breakdown */}
          <div className="lg:col-span-7 bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground">
              Performance by Marketing Channel
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Spend (KES)</th>
                    <th className="py-2.5 px-3">Conversions</th>
                    <th className="py-2.5 px-3">Revenue (KES)</th>
                    <th className="py-2.5 px-3">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {summary ? (
                    <>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground">GOOGLE ADS</td>
                        <td className="py-3 px-3">{formatKSh(summary.googleStats.spend)}</td>
                        <td className="py-3 px-3 text-brand-emerald font-bold">{summary.googleStats.conversions}</td>
                        <td className="py-3 px-3">{formatKSh(summary.googleStats.revenue)}</td>
                        <td className="py-3 px-3 font-bold text-brand-emerald">{summary.googleStats.roas > 0 ? `${summary.googleStats.roas.toFixed(1)}x` : "—"}</td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground">META ADS</td>
                        <td className="py-3 px-3">{formatKSh(summary.metaStats.spend)}</td>
                        <td className="py-3 px-3 text-brand-emerald font-bold">{summary.metaStats.conversions}</td>
                        <td className="py-3 px-3">{formatKSh(summary.metaStats.revenue)}</td>
                        <td className="py-3 px-3 font-bold text-brand-emerald">{summary.metaStats.roas > 0 ? `${summary.metaStats.roas.toFixed(1)}x` : "—"}</td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground">ORGANIC / DIRECT</td>
                        <td className="py-3 px-3">KSh 0</td>
                        <td className="py-3 px-3 text-brand-emerald font-bold">{summary.organicStats.conversions}</td>
                        <td className="py-3 px-3">{formatKSh(summary.organicStats.revenue)}</td>
                        <td className="py-3 px-3 font-bold text-muted-foreground">—</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Loading performance summary...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Kenyan Counties Distribution */}
          <div className="lg:col-span-5 bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-emerald" />
              Top Counties by Marketing Sales
            </h2>

            <div className="space-y-3">
              {summary?.countyPerformance && summary.countyPerformance.length > 0 ? (
                summary.countyPerformance.slice(0, 5).map((cp) => (
                  <div
                    key={cp.county}
                    className="p-3 bg-muted/20 border border-border rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground">{cp.county}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {cp.orders} order{cp.orders > 1 ? "s" : ""} • via {cp.topChannel}
                      </div>
                    </div>
                    <div className="font-bold text-brand-emerald">
                      {formatKSh(cp.revenue)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground py-6 text-center">
                  County attribution data will populate as M-Pesa orders are processed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Events Ledger */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
              Recent Marketing Conversions &amp; Touchpoints
            </h2>
            <Link
              href="/admin/marketing/events"
              className="text-xs font-bold text-brand-emerald hover:underline inline-flex items-center gap-1"
            >
              View Full Event Ledger <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">County</th>
                  <th className="py-2.5 px-3">Value (KES)</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentEvents.length > 0 ? (
                  recentEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {ev.eventId}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold">
                          {ev.eventType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {AttributionEngine.getPrimaryChannel(ev.attribution)}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{ev.county || "Kenya"}</td>
                      <td className="py-3 px-3 font-bold text-brand-emerald">
                        {ev.value ? formatKSh(ev.value) : "—"}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(ev.timestamp).toLocaleTimeString("en-KE")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No conversions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
