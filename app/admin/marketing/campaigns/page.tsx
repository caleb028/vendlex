"use client";

import React, { useState, useEffect } from "react";
import { AdminMarketingNav } from "@/components/admin/marketing-nav";
import {
  Megaphone,
  Plus,
  TrendingUp,
  Play,
  Pause,
  Filter,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";
import { MarketingCampaign, CampaignStatus } from "@/lib/marketing/types";

export default function AdminMarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Campaign Modal State
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState<"GOOGLE" | "META" | "CROSS_PLATFORM">("GOOGLE");
  const [newDailyBudget, setNewDailyBudget] = useState("1500");
  const [newTotalBudget, setNewTotalBudget] = useState("15000");
  const [newTargetAudience, setNewTargetAudience] = useState("Nairobi, Kiambu, Nakuru, Mombasa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing/campaigns");
      const data = await res.json();
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: CampaignStatus) => {
    const newStatus: CampaignStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/marketing/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Campaign status updated to ${newStatus}.`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          platform: newPlatform,
          dailyBudget: parseFloat(newDailyBudget) || 1000,
          budgetAmount: parseFloat(newTotalBudget) || 10000,
          targetCounties: newTargetAudience.split(",").map((c) => c.trim()).filter(Boolean),
          status: "ACTIVE",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess("New platform advertising campaign launched successfully!");
        setTimeout(() => setActionSuccess(null), 3500);
        setShowModal(false);
        setNewName("");
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterPlatform !== "ALL" && c.platform !== filterPlatform) return false;
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-off-white dark:bg-brand-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <AdminMarketingNav />

        {/* Top Header & Launch Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-brand-dark-card border border-border p-5 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-emerald" />
              Platform &amp; Merchant Advertising Campaigns
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage Google Shopping, Search, and Meta Feed campaigns across Kenyan inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCampaigns}
              disabled={loading}
              className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Refresh campaigns"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Platform Campaign</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-brand-emerald flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-brand-dark-card border border-border p-3 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold px-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            aria-label="Filter by platform"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
          >
            <option value="ALL">All Platforms</option>
            <option value="GOOGLE">Google Ads / Shopping</option>
            <option value="META">Meta Ads / Catalog</option>
            <option value="CROSS_PLATFORM">Cross-Platform</option>
          </select>

          <select
            aria-label="Filter by campaign status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
                <tr>
                  <th className="py-3 px-4">Campaign Title &amp; Scope</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Daily Budget</th>
                  <th className="py-3 px-3">Total Spend</th>
                  <th className="py-3 px-3">Attributed Sales</th>
                  <th className="py-3 px-3">ROAS</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((c) => {
                    const roas = c.metrics?.roas || (c.metrics?.spend > 0 ? c.metrics.attributedRevenue / c.metrics.spend : 0);
                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-bold text-foreground text-xs">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {c.sellerName || "VendLex Platform"} • {c.targetCounties?.join(", ") || "All Kenya"}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-bold">
                            {c.platform}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-100 text-brand-emerald"
                                : c.status === "PAUSED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.status === "ACTIVE" ? "bg-brand-emerald" : "bg-muted-foreground"
                              }`}
                            />
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-foreground">
                          {c.dailyBudget ? `${formatKSh(c.dailyBudget)}/day` : formatKSh(c.budgetAmount)}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-muted-foreground">
                          {formatKSh(c.metrics?.spend || 0)}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-brand-emerald">
                          {formatKSh(c.metrics?.attributedRevenue || 0)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              roas >= 4
                                ? "bg-emerald-100 text-brand-emerald"
                                : roas > 0
                                ? "bg-blue-100 text-blue-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {roas > 0 ? `${roas.toFixed(1)}x` : "—"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c.id, c.status)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-[11px] font-bold text-foreground transition-colors"
                          >
                            {c.status === "ACTIVE" ? (
                              <>
                                <Pause className="w-3 h-3 text-amber-600" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 text-brand-emerald" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No campaigns found matching selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Campaign Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-brand-emerald" />
                  Launch Platform Campaign
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Kenya Top Tech Deals - September Shopping Blitz"
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Ad Platform</label>
                    <select
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value as any)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                    >
                      <option value="GOOGLE">Google Ads &amp; Shopping</option>
                      <option value="META">Meta Ads &amp; Catalog</option>
                      <option value="CROSS_PLATFORM">Cross-Platform (All Channels)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Target Counties</label>
                    <input
                      type="text"
                      value={newTargetAudience}
                      onChange={(e) => setNewTargetAudience(e.target.value)}
                      placeholder="e.g. Nairobi, Kiambu, Nakuru, Mombasa"
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Daily Budget (KES)</label>
                    <input
                      type="number"
                      min="100"
                      value={newDailyBudget}
                      onChange={(e) => setNewDailyBudget(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Total Cap Budget (KES)</label>
                    <input
                      type="number"
                      min="500"
                      value={newTotalBudget}
                      onChange={(e) => setNewTotalBudget(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-bold text-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newName.trim()}
                    className="px-5 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold shadow-sm"
                  >
                    {isSubmitting ? "Launching..." : "Launch Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
