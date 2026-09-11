"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS, CATEGORIES, KENYAN_COUNTIES, KENYAN_TOWNS } from "@/lib/data/kenya-data";
import { ProductCard } from "@/components/marketplace/product-card";
import { formatKSh } from "@/lib/utils";
import {
  SlidersHorizontal,
  Search,
  X,
  Star,
  MapPin,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";
  const initialCounty = searchParams.get("county") || "all";

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCounty, setSelectedCounty] = useState(initialCounty);
  const [selectedTown, setSelectedTown] = useState("all");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [deliverySpeed, setDeliverySpeed] = useState<"all" | "same-day" | "pickup">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "rating">("featured");

  // Drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Available towns based on selected county
  const availableTowns = useMemo(() => {
    if (selectedCounty !== "all" && KENYAN_TOWNS[selectedCounty]) {
      return KENYAN_TOWNS[selectedCounty];
    }
    return [];
  }, [selectedCounty]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedCounty("all");
    setSelectedTown("all");
    setMinPrice(0);
    setMaxPrice(300000);
    setMinRating(0);
    setVerifiedOnly(false);
    setInStockOnly(false);
    setDeliverySpeed("all");
    setSortBy("featured");
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        const matchesBiz = product.businessName.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCat && !matchesBiz && !matchesTags) return false;
      }

      // Category
      if (selectedCategory !== "all") {
        const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
        if (catObj && product.category !== catObj.name) return false;
      }

      // County
      if (selectedCounty !== "all" && product.county.toLowerCase() !== selectedCounty.toLowerCase()) {
        return false;
      }

      // Town
      if (selectedTown !== "all" && product.town && product.town.toLowerCase() !== selectedTown.toLowerCase()) {
        return false;
      }

      // Price Range
      if (product.price < minPrice || product.price > maxPrice) return false;

      // Rating
      if (minRating > 0 && product.rating < minRating) return false;

      // Verified Only
      if (verifiedOnly && !product.businessVerified) return false;

      // In Stock
      if (inStockOnly && !product.inStock) return false;

      // Delivery Speed
      if (deliverySpeed === "same-day") {
        const isSameDay =
          product.deliveryInfo?.toLowerCase().includes("same-day") ||
          product.deliveryInfo?.toLowerCase().includes("nairobi");
        if (!isSameDay) return false;
      } else if (deliverySpeed === "pickup") {
        const isPickup = product.deliveryInfo?.toLowerCase().includes("pickup");
        if (!isPickup) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedCounty,
    selectedTown,
    minPrice,
    maxPrice,
    minRating,
    verifiedOnly,
    inStockOnly,
    deliverySpeed,
    sortBy,
  ]);

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedCounty !== "all" ? 1 : 0) +
    (selectedTown !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (deliverySpeed !== "all" ? 1 : 0) +
    (maxPrice < 300000 ? 1 : 0);

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Trust Highlight Banner */}
        <div className="bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl p-4 shadow-card flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <ShieldCheck className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>VendLex Buyer Guarantee: 100% Escrow Protection &amp; Verified M-Pesa STK</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground font-medium text-[11px]">
            <span>🚚 47 Counties Courier</span>
            <span>📑 Instant eTIMS Receipts</span>
          </div>
        </div>

        {/* Top Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Kenyan Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Discover verified Kenyan products, genuine brands, and vetted regional suppliers.
            </p>
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, stores..."
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-white dark:bg-brand-dark-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald shadow-xs font-medium"
              />
              <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-brand-emerald text-white shadow-xs"
                : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Departments
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? "bg-brand-emerald text-white font-bold shadow-xs"
                  : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Compact Toolbar: Filter Drawer Button & Sort Selector per Section 12 */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Filter Drawer Trigger Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-foreground transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-brand-emerald text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-brand-emerald font-bold hover:underline hidden sm:inline"
              >
                Clear all
              </button>
            )}

            <span className="text-xs text-muted-foreground hidden md:inline">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-brand-emerald"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid (Clean, Breathing Layout) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No products found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search keyword or clearing your active filters.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-5 py-2 rounded-xl text-xs shadow-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="marketplace-card-animated"
                style={{ animationDelay: `${(index % 8) * 55}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Filter Drawer per Section 12 & 34 */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-full max-w-md bg-white dark:bg-brand-dark-card shadow-2xl h-full flex flex-col justify-between z-10 animate-slideLeft overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-emerald" />
                <h3 className="text-sm font-black text-foreground">Filter Catalog</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-brand-emerald text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-brand-emerald font-bold hover:underline"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Controls Stack */}
            <div className="p-6 space-y-6 flex-1">
              {/* County Location */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  County Location
                </label>
                <select
                  value={selectedCounty}
                  onChange={(e) => {
                    setSelectedCounty(e.target.value);
                    setSelectedTown("all");
                  }}
                  className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground focus:outline-none focus:border-brand-emerald"
                >
                  <option value="all">All 47 Counties</option>
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Town (if county selected) */}
              {availableTowns.length > 0 && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Town in {selectedCounty}
                  </label>
                  <select
                    value={selectedTown}
                    onChange={(e) => setSelectedTown(e.target.value)}
                    className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground focus:outline-none focus:border-brand-emerald"
                  >
                    <option value="all">All Towns</option>
                    {availableTowns.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Speed */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Delivery Speed
                </label>
                <div className="space-y-2">
                  {[
                    { id: "all", label: "All Delivery Options" },
                    { id: "same-day", label: "🚚 Same-Day Delivery" },
                    { id: "pickup", label: "🏬 Local Pickup Ready" },
                  ].map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === opt.id}
                        onChange={() => setDeliverySpeed(opt.id as any)}
                        className="text-brand-emerald focus:ring-brand-emerald accent-brand-emerald"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between items-center text-xs font-bold text-foreground">
                  <span>Max Price:</span>
                  <span className="text-brand-emerald">{formatKSh(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={300000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-emerald cursor-pointer"
                />
              </div>

              {/* Toggles: Verified & In Stock */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-brand-emerald focus:ring-brand-emerald w-4 h-4 accent-brand-emerald"
                  />
                  <span className="font-semibold">Verified Sellers Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-brand-emerald focus:ring-brand-emerald w-4 h-4 accent-brand-emerald"
                  />
                  <span className="font-semibold">In Stock Items Only</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 4, 4.5].map((rat) => (
                    <button
                      key={rat}
                      onClick={() => setMinRating(rat)}
                      className={`flex-1 py-1.5 text-xs rounded-xl border font-bold ${
                        minRating === rat
                          ? "bg-brand-emerald text-white border-brand-emerald"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {rat === 0 ? "All" : `${rat}★+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-border bg-muted/20">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 rounded-xl text-xs shadow-xs transition-colors"
              >
                View {filteredProducts.length} Results
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-semibold">Loading Marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
