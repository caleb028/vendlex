"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_PRODUCTS } from "@/lib/data/kenya-data";
import { ProductCard } from "../marketplace/product-card";
import { ArrowRight, Flame } from "lucide-react";

export function DealsSection() {
  const deals = MOCK_PRODUCTS.filter((p) => p.isDeal).slice(0, 4);

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-brand-dark-card border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-current text-red-500 animate-pulse" />
              <span>Flash Offers &amp; Discounts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Today&apos;s Featured Deals
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Hand-picked discounts with verified escrow and fast Kenya-wide dispatch.
            </p>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <span>View All Hot Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* 4 Products Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {deals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
