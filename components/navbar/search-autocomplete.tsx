"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Store, Package, Wrench, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_PRODUCTS, MOCK_BUSINESSES, MOCK_SERVICES, CATEGORIES, KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";

export function SearchAutocomplete({
  placeholder = "Search products, businesses or services...",
  className = "",
  initialLocation = "Nairobi",
}: {
  placeholder?: string;
  className?: string;
  initialLocation?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(initialLocation);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanQuery = query.toLowerCase().trim();

  const filteredProducts = cleanQuery
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      ).slice(0, 3)
    : [];

  const filteredBusinesses = cleanQuery
    ? MOCK_BUSINESSES.filter(
        (b) =>
          b.name.toLowerCase().includes(cleanQuery) ||
          b.category.toLowerCase().includes(cleanQuery) ||
          b.tagline.toLowerCase().includes(cleanQuery)
      ).slice(0, 2)
    : [];

  const filteredServices = cleanQuery
    ? MOCK_SERVICES.filter(
        (s) =>
          s.title.toLowerCase().includes(cleanQuery) ||
          s.category.toLowerCase().includes(cleanQuery)
      ).slice(0, 2)
    : [];

  const filteredCategories = cleanQuery
    ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(cleanQuery)).slice(0, 2)
    : [];

  const hasResults =
    filteredProducts.length > 0 ||
    filteredBusinesses.length > 0 ||
    filteredServices.length > 0 ||
    filteredCategories.length > 0;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/marketplace?q=${encodeURIComponent(query)}&county=${encodeURIComponent(location)}`);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-sm hover:shadow-md focus-within:border-brand-emerald focus-within:ring-2 focus-within:ring-brand-emerald/20 transition-all overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center flex-1 px-4 py-2.5">
          <Search className="w-5 h-5 text-brand-emerald shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="hidden sm:flex items-center border-l border-border dark:border-brand-dark-border px-3 py-2 bg-muted/40 dark:bg-brand-dark-bg/40">
          <MapPin className="w-4 h-4 text-brand-emerald shrink-0 mr-1.5" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-1"
          >
            {KENYAN_COUNTIES.map((county) => (
              <option key={county} value={county} className="bg-white dark:bg-brand-dark-card text-foreground">
                {county}
              </option>
            ))}
          </select>
        </div>

        {/* Search Action Button */}
        <button
          type="submit"
          className="bg-brand-emerald hover:bg-brand-emerald-dark text-white px-5 py-3.5 font-medium text-sm transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && cleanQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[80vh] overflow-y-auto animate-scaleUp">
          {hasResults ? (
            <div className="p-2 divide-y divide-border/60 dark:divide-brand-dark-border/60">
              {/* Categories */}
              {filteredCategories.length > 0 && (
                <div className="p-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Categories
                  </div>
                  {filteredCategories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/marketplace?category=${c.id}`);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted dark:hover:bg-brand-dark-border text-left transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <span className="text-xs text-brand-emerald font-semibold">{c.productCount} items</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Businesses */}
              {filteredBusinesses.length > 0 && (
                <div className="p-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Kenyan Businesses & Stores
                  </div>
                  {filteredBusinesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/businesses/${b.slug}`);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted dark:hover:bg-brand-dark-border text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-brand-emerald shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground truncate">{b.name}</span>
                          {b.isVerified && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-brand-emerald px-1.5 py-0.2 rounded font-bold">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{b.town}, {b.county} • {b.category}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-600">★ {b.rating}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Products */}
              {filteredProducts.length > 0 && (
                <div className="p-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Products
                  </div>
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/products/${p.slug}`);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted dark:hover:bg-brand-dark-border text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground truncate">By {p.businessName} • {p.county}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-emerald">{formatKSh(p.price)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Services */}
              {filteredServices.length > 0 && (
                <div className="p-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Kenyan Services
                  </div>
                  {filteredServices.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/services?highlight=${s.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted dark:hover:bg-brand-dark-border text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.providerName} • {s.county}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-emerald">From {formatKSh(s.startingPrice)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* View all search button */}
              <div className="p-2 bg-muted/30 dark:bg-brand-dark-bg/40 text-center">
                <button
                  onClick={() => handleSearch()}
                  className="text-xs font-semibold text-brand-emerald hover:underline py-1"
                >
                  View all results for &quot;{query}&quot; in {location} &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No direct matches for &quot;{query}&quot;. Press Search to see all marketplace results.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
