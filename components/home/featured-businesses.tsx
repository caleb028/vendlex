import React from "react";
import Link from "next/link";
import { MOCK_BUSINESSES } from "@/lib/data/kenya-data";
import { BusinessCard } from "../businesses/business-card";
import { ArrowRight, Sparkles } from "lucide-react";

export function FeaturedBusinesses() {
  const featured = MOCK_BUSINESSES.slice(0, 4);

  return (
    <section className="py-16 bg-white dark:bg-brand-dark-card border-y border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald dark:text-brand-emerald-light uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Storefronts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Discover Featured Businesses
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Shop directly from verified Kenyan merchants, local artisans, and leading tech suppliers with guaranteed authenticity.
            </p>
          </div>
          <Link
            href="/businesses"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors"
          >
            <span>Explore All Businesses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Business Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    </section>
  );
}
