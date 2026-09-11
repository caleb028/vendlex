"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Building2, Store, Megaphone } from "lucide-react";
import { ServerAdvertisement } from "@/lib/server-db/types";
import { BusinessAdCard } from "@/components/advertisements/business-ad-card";

export function SponsoredBusinessesSection() {
  const [ads, setAds] = useState<ServerAdvertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/advertisements?limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.advertisements)) {
          setAds(data.advertisements);
        }
      })
      .catch((err) => console.error("Error loading sponsored ads:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-28 bg-muted rounded-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-amber-500/[0.03] via-transparent to-transparent border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Business Spotlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Sponsored Kenyan Businesses &amp; Services
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Discover verified physical shops, workshops, clinics, and professional service experts across all 47 counties.
            </p>
          </div>

          <Link
            href="/advertise"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/40 border border-brand-emerald/30 hover:border-brand-emerald px-3.5 py-2 rounded-xl shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
          >
            <Megaphone className="w-4 h-4 text-brand-emerald" />
            <span>Advertise Business (KES 1,020 / 30 Days)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Ads Grid */}
        {ads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <BusinessAdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          /* Empty / Call to Action State for first advertisers */
          <div className="bg-gradient-to-br from-amber-500/10 via-brand-emerald/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Don&apos;t Sell Online? Advertise Your Physical Business Here
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect your hardware store, clinic, auto garage, beauty salon, law firm, or local shop with thousands of active buyers in your county.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/advertise"
                className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all"
              >
                <span>Launch Business Ad &bull; KES 1,020 / 30 Days</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
