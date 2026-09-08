"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_BUSINESSES, CATEGORIES, KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import { BusinessCard } from "@/components/businesses/business-card";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Store,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Map,
} from "lucide-react";

function BusinessesContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCounty, setSelectedCounty] = useState(searchParams.get("county") || "all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesTag = b.tagline.toLowerCase().includes(q);
        const matchesTown = b.town.toLowerCase().includes(q);
        const matchesCat = b.category.toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesTown && !matchesCat) return false;
      }

      if (selectedCounty !== "all" && b.county.toLowerCase() !== selectedCounty.toLowerCase()) {
        return false;
      }

      if (selectedCategory !== "all" && b.category !== selectedCategory) {
        return false;
      }

      if (verifiedOnly && !b.isVerified) return false;
      if (openNowOnly && !b.isOpenNow) return false;

      return true;
    });
  }, [query, selectedCounty, selectedCategory, verifiedOnly, openNowOnly]);

  const resetFilters = () => {
    setQuery("");
    setSelectedCounty("all");
    setSelectedCategory("all");
    setVerifiedOnly(false);
    setOpenNowOnly(false);
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-emerald-dark via-brand-emerald to-brand-charcoal rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-brand-gold text-brand-charcoal text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>National Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Find Verified Kenyan Businesses
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Search vetted electronics suppliers, African fashion ateliers, organic beauty brands, and master technicians across all 47 counties.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/seller/onboarding"
              className="bg-white text-brand-emerald hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all inline-block"
            >
              List Your Business +
            </a>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search business name, product..."
                className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>

            {/* County */}
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-brand-red" />
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              >
                <option value="all">All 47 Counties</option>
                {KENYAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
              >
                <option value="all">All Business Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-foreground font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-brand-emerald accent-brand-emerald w-4 h-4"
                />
                <span>Verified Only</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-foreground font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(e) => setOpenNowOnly(e.target.checked)}
                  className="rounded text-brand-emerald accent-brand-emerald w-4 h-4"
                />
                <span>Open Now</span>
              </label>
            </div>
          </div>
        </div>

        {/* Directory Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {filtered.length} Businesses Found
            </span>
            {(query || selectedCounty !== "all" || selectedCategory !== "all" || verifiedOnly || openNowOnly) && (
              <button
                onClick={resetFilters}
                className="text-xs text-brand-red font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-12 text-center space-y-4">
              <Store className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">No businesses found</h3>
              <p className="text-xs text-muted-foreground">Try selecting &quot;All Counties&quot; or changing your search terms.</p>
              <button
                onClick={resetFilters}
                className="bg-brand-emerald text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Show All Businesses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading VendLex Business Directory...</div>}>
      <BusinessesContent />
    </Suspense>
  );
}
