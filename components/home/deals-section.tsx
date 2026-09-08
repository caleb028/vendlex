"use client";

import React from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/data/kenya-data";
import { ProductCard } from "../marketplace/product-card";
import { ArrowRight, Flame } from "lucide-react";

export function DealsSection() {
  const deals = MOCK_PRODUCTS.filter((p) => p.isDeal).slice(0, 4);

  return (
    <section className="py-10 sm:py-14 bg-brand-off-white dark:bg-brand-dark-bg border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header per Section 17 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-current" />
              <span>Limited Time Offers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Today&apos;s Deals
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hand-picked discounts from verified Kenyan sellers.
            </p>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Products Preview per Section 17 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
