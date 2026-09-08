"use client";

import React, { useState, useEffect } from "react";
import { MOCK_PRODUCTS, KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import { ProductCard } from "@/components/marketplace/product-card";
import { formatKSh } from "@/lib/utils";
import {
  Flame,
  Clock,
  Sparkles,
  Zap,
  Tag,
  TrendingUp,
  Package,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DealsPage() {
  const [activeSection, setActiveSection] = useState<
    "flash" | "today" | "trending" | "new" | "clearance" | "under1000" | "county"
  >("flash");

  const [selectedCounty, setSelectedCounty] = useState("Nairobi");

  // Real Countdown Timer for Flash Deals
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter datasets per Guideline #14
  const flashDeals = MOCK_PRODUCTS.filter((p) => p.isDeal && (p.discountPercentage || 0) >= 15);
  const todaysDeals = MOCK_PRODUCTS.filter((p) => p.isDeal || p.discountPercentage);
  const trendingDeals = MOCK_PRODUCTS.filter((p) => p.rating >= 4.7);
  const newArrivals = MOCK_PRODUCTS.slice().reverse();
  const clearanceDeals = MOCK_PRODUCTS.filter((p) => (p.discountPercentage || 0) >= 20 || p.stockCount <= 5);
  const under1000 = MOCK_PRODUCTS.filter((p) => p.price <= 5000);
  const countyDeals = MOCK_PRODUCTS.filter(
    (p) => p.county.toLowerCase() === selectedCounty.toLowerCase()
  );

  const getSectionProducts = () => {
    switch (activeSection) {
      case "flash":
        return flashDeals.length > 0 ? flashDeals : todaysDeals;
      case "today":
        return todaysDeals;
      case "trending":
        return trendingDeals;
      case "new":
        return newArrivals;
      case "clearance":
        return clearanceDeals.length > 0 ? clearanceDeals : todaysDeals;
      case "under1000":
        return under1000.length > 0 ? under1000 : todaysDeals;
      case "county":
        return countyDeals.length > 0 ? countyDeals : todaysDeals;
      default:
        return todaysDeals;
    }
  };

  const currentProducts = getSectionProducts();

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner with Flash Countdown */}
        <div className="bg-gradient-to-r from-red-950 via-brand-red to-brand-charcoal rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-red-500/30 relative overflow-hidden">
          <div className="space-y-3 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-white text-brand-red text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span>VendLex Flash Deals Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Kenyan Mega Discounts &amp; Daily Price Cuts
            </h1>
            <p className="text-xs sm:text-base text-red-100 leading-relaxed">
              Shop verified Kenyan merchants offering limited-time promotional pricing on authentic electronics, apparel, kitchenware, and solar equipment.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center space-y-2 shrink-0 relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Flash Deals End In:</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-mono font-black text-2xl sm:text-4xl text-white">
              <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/15">
                {String(timeLeft.hours).padStart(2, "0")}
                <span className="block text-[9px] font-sans font-normal text-gray-400 uppercase">Hours</span>
              </div>
              <span>:</span>
              <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/15">
                {String(timeLeft.minutes).padStart(2, "0")}
                <span className="block text-[9px] font-sans font-normal text-gray-400 uppercase">Mins</span>
              </div>
              <span>:</span>
              <div className="bg-white/10 px-3 py-2 rounded-2xl border border-white/15 text-amber-400">
                {String(timeLeft.seconds).padStart(2, "0")}
                <span className="block text-[9px] font-sans font-normal text-gray-400 uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Deal Section Tabs per Guideline #14 */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-3 sm:p-4 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: "flash", label: "⚡ FLASH DEALS", count: flashDeals.length },
            { id: "today", label: "📅 TODAY'S DEALS", count: todaysDeals.length },
            { id: "trending", label: "🔥 TRENDING", count: trendingDeals.length },
            { id: "new", label: "✨ NEW ARRIVALS", count: newArrivals.length },
            { id: "clearance", label: "🏷️ CLEARANCE", count: clearanceDeals.length },
            { id: "under1000", label: "💰 UNDER KSH 5,000", count: under1000.length },
            { id: "county", label: "📍 COUNTY DEALS", count: countyDeals.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all ${
                activeSection === tab.id
                  ? "bg-brand-red text-white shadow-md scale-102"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* County Selector for COUNTY DEALS tab */}
        {activeSection === "county" && (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 animate-fadeIn">
            <span className="text-xs font-bold text-foreground">Select County for Local Deals:</span>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground"
            >
              {KENYAN_COUNTIES.map((c) => (
                <option key={c} value={c}>{c} County</option>
              ))}
            </select>
          </div>
        )}

        {/* Deals Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{currentProducts.length}</strong> discounted offers
            </span>
            <span className="text-brand-emerald font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>VendLex Escrow &amp; Fast Courier Delivery</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
