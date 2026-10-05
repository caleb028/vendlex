"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Megaphone,
  ArrowLeft,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
} from "lucide-react";
import { formatKSh } from "@/lib/utils";

interface SellerProduct {
  id: string;
  title: string;
  price: number;
  stockCount?: number;
  image?: string;
  category?: string;
}

export default function SellerPromotePage() {
  const router = useRouter();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignPlatform, setCampaignPlatform] = useState<
    "GOOGLE" | "META" | "CROSS_PLATFORM"
  >("GOOGLE");
  const [dailyBudget, setDailyBudget] = useState<number>(500);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [targetCounties, setTargetCounties] = useState<string>("All Kenya (47 Counties)");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch seller's products from inventory API
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/seller/inventory");
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
          if (data.products.length > 0) {
            setSelectedProductId(data.products[0].id);
            setCampaignTitle(`Promote ${data.products[0].title}`);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
  }, []);

  const totalBudget = dailyBudget * durationDays;

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setCampaignTitle(`Promote ${p.title}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setErrorMsg("Please check the confirmation box authorizing the ad budget.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/seller/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignTitle,
          platform: campaignPlatform,
          productId: selectedProductId || undefined,
          dailyBudget: dailyBudget,
          budgetAmount: totalBudget,
          targetCounties: targetCounties.split(",").map((c) => c.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/seller/marketing");
      } else {
        setErrorMsg(data.error || "Failed to create advertising campaign.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          href="/seller/marketing"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketing Hub</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald uppercase tracking-wider mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Product Campaign Wizard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            Promote Your Product Across Kenya
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set your budget, pick your target channels, and track real-time sales attribution.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Product */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Step 1: Select Product to Promote
            </label>
            {products.length > 0 ? (
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-emerald/40 font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {formatKSh(p.price)} {p.stockCount !== undefined ? `(${p.stockCount} in stock)` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-muted/40 rounded-xl text-xs text-muted-foreground text-center">
                Loading your products...
              </div>
            )}
          </div>

          {/* Step 2: Choose Ad Channel */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Step 2: Choose Advertising Network
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "GOOGLE" as const,
                  title: "Google Shopping & Search",
                  desc: "Show at top of Google search results for buyers in Kenya",
                  badge: "Highest Intent",
                },
                {
                  id: "META" as const,
                  title: "Meta / Instagram",
                  desc: "Dynamic catalog ads on Facebook & Instagram feeds & stories",
                  badge: "Highest Reach",
                },
                {
                  id: "CROSS_PLATFORM" as const,
                  title: "Cross-Platform Blitz",
                  desc: "Simultaneous promotion across Google, Meta, and Spotlight",
                  badge: "Maximum Impact",
                },
              ].map((ch) => (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => setCampaignPlatform(ch.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    campaignPlatform === ch.id
                      ? "border-brand-emerald bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-brand-emerald/40"
                      : "border-border bg-white dark:bg-brand-dark-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-foreground">{ch.title}</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-brand-emerald px-1.5 py-0.5 rounded font-bold">
                      {ch.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{ch.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Budget & Duration */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-foreground">
              Step 3: Set Daily Budget &amp; Campaign Duration
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1 font-semibold">
                  Daily Budget (KES)
                </span>
                <div className="flex gap-2">
                  {[300, 500, 1000, 2000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDailyBudget(amt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        dailyBudget === amt
                          ? "bg-brand-emerald text-white border-brand-emerald"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1 font-semibold">
                  Duration (Days)
                </span>
                <div className="flex gap-2">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      type="button"
                      key={days}
                      onClick={() => setDurationDays(days)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        durationDays === days
                          ? "bg-brand-emerald text-white border-brand-emerald"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Budget Summary Card */}
          <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Daily Ad Spend:</span>
              <span className="font-bold text-foreground">{formatKSh(dailyBudget)} / day</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Campaign Duration:</span>
              <span className="font-bold text-foreground">{durationDays} days</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/80">
              <span className="font-bold text-foreground">Total Budget Commitment:</span>
              <span className="text-base font-black text-brand-emerald">{formatKSh(totalBudget)}</span>
            </div>
          </div>

          {/* Step 5: Explicit Authorization Checkbox */}
          <div className="p-4 rounded-2xl border border-border bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-3">
            <input
              id="confirm-budget"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border text-brand-emerald focus:ring-brand-emerald"
            />
            <label
              htmlFor="confirm-budget"
              className="text-xs text-foreground cursor-pointer leading-relaxed select-none"
            >
              I authorize VendLex Kenya to promote this product on my selected channels for the specified total budget of{" "}
              <strong>{formatKSh(totalBudget)}</strong> ({durationDays} days @ {formatKSh(dailyBudget)}/day).
              I understand all conversions and customer purchases will be verified and attributed in real-time.
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/seller/marketing"
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !confirmed}
              className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black shadow-md transition-all flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>{isSubmitting ? "Launching Campaign..." : "Launch Ad Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
