"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, TrendingUp, Wrench, ArrowRight } from "lucide-react";

export function Hero3Pillars() {
  return (
    <section className="py-8 sm:py-12" aria-label="VendLex Three Pillars">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {/* 1. SHOP */}
        <div className="group bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-emerald/40 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-emerald-soft text-brand-emerald flex items-center justify-center transition-transform group-hover:scale-105">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">SHOP</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Discover products from trusted Kenyan sellers.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors group-hover:gap-2.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. GROW */}
        <div className="group bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">GROW</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Tools to help Kenyan businesses sell and grow.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/seller/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors group-hover:gap-2.5"
            >
              <span>Start Selling</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3. PROSPER */}
        <div className="group bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-gold/40 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-brand-gold dark:text-brand-gold-light flex items-center justify-center transition-transform group-hover:scale-105">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">PROSPER</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Find verified professionals near you.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold dark:text-brand-gold-light hover:text-amber-600 transition-colors group-hover:gap-2.5"
            >
              <span>Find a Professional</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
