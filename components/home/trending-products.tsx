import React from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/data/kenya-data";
import { ProductCard } from "../marketplace/product-card";
import { ArrowRight, Flame } from "lucide-react";

export function TrendingProducts() {
  const products = MOCK_PRODUCTS.slice(0, 8);

  return (
    <section className="py-16 bg-brand-off-white dark:bg-brand-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald dark:text-brand-emerald-light uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>In-Demand Right Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Trending Kenyan Products
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Most sought-after gadgets, fashion, home essentials, and lifestyle goods ordered across Nairobi and beyond.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors"
          >
            <span>Browse Full Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
