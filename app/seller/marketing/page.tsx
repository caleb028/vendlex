"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";
import { MarketingCampaign } from "@/lib/marketing/types";

export default function SellerMarketingHubPage() {
  const [data, setData] = useState<{
    timeframe: string;
    totalConversions: number;
    attributedRevenueKes: number;
    campaigns: MarketingCampaign[];
    feedStatus: {
      inGoogleShopping: boolean;
      inMetaCatalog: boolean;
      eligibleCount: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSellerMarketing = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/marketing");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerMarketing();
  }, []);

  const totalSpent = data?.campaigns?.reduce((acc, c) => acc + (c.metrics?.spend || 0), 0) || 0;
  const overallRoas = totalSpent > 0 && data?.attributedRevenueKes ? data.attributedRevenueKes / totalSpent : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-emerald-dark to-brand-emerald text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>VendLex Ads &amp; Growth Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Grow Your Sales Across Kenya with Google &amp; Meta Ads
          </h1>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">
            Put your products directly in front of buyers searching on Google and scrolling on Instagram &amp; Facebook. Track every shilling with verified Lipa na M-Pesa attribution.
          </p>
          <div className="pt-2">
            <Link
              href="/seller/marketing/promote"
              className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-brand-emerald-dark font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Promote a Product Now</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Attributed Sales</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-brand-emerald">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {data ? formatKSh(data.attributedRevenueKes) : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Generated via promoted ads</p>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Conversions</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {data ? data.totalConversions : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">M-Pesa paid checkout orders</p>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Ad Return (ROAS)</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-emerald">
            {overallRoas > 0 ? `${overallRoas.toFixed(1)}x` : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Return on advertising spend</p>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Campaigns</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {data ? data.campaigns.filter((c) => c.status === "ACTIVE").length : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground">Running across Google &amp; Meta</p>
        </div>
      </div>

      {/* Feed Syndication Status Card */}
      <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            Automated Catalog Syndication Status
          </h2>
          <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald px-2.5 py-0.5 rounded-full font-bold">
            Live in National Feeds
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your eligible in-stock products are automatically formatted and syndicated in VendLex&apos;s national Google Merchant Shopping XML and Meta Product Catalog feeds.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald" />
              <span className="font-semibold text-foreground">Google Shopping XML Feed</span>
            </div>
            <span className="text-[11px] font-bold text-brand-emerald">Synced</span>
          </div>
          <div className="p-3 bg-muted/20 border border-border rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald" />
              <span className="font-semibold text-foreground">Meta Commerce Catalog CSV</span>
            </div>
            <span className="text-[11px] font-bold text-brand-emerald">Synced</span>
          </div>
        </div>
      </div>

      {/* Seller Campaigns Table */}
      <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-sm space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">My Promoted Products &amp; Campaigns</h2>
          <Link
            href="/seller/marketing/promote"
            className="text-xs font-bold text-brand-emerald hover:underline inline-flex items-center gap-1"
          >
            Create New Campaign <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Campaign / Product</th>
                <th className="py-2.5 px-3">Ad Platform</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Daily Budget</th>
                <th className="py-2.5 px-3">Spent</th>
                <th className="py-2.5 px-3">Sales Generated</th>
                <th className="py-2.5 px-3">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data?.campaigns && data.campaigns.length > 0 ? (
                data.campaigns.map((c) => {
                  const roas = c.metrics?.roas || (c.metrics?.spend > 0 ? c.metrics.attributedRevenue / c.metrics.spend : 0);
                  return (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground">{c.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold">
                          {c.platform}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-100 text-brand-emerald"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {c.dailyBudget ? `${formatKSh(c.dailyBudget)}/day` : formatKSh(c.budgetAmount)}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {formatKSh(c.metrics?.spend || 0)}
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-emerald">
                        {formatKSh(c.metrics?.attributedRevenue || 0)}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        {roas > 0 ? `${roas.toFixed(1)}x` : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    You haven&apos;t launched any advertising campaigns yet.
                    <div className="pt-2">
                      <Link
                        href="/seller/marketing/promote"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Launch your first product ad campaign</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
