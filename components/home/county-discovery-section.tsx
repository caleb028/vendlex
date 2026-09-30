"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Store, Wrench, Package } from "lucide-react";
import { KENYAN_COUNTIES } from "@/lib/data/kenya-data";

export function CountyDiscoverySection() {
  const [selectedCounty, setSelectedCounty] = useState("Nairobi");

  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-brand-dark-card border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-900 via-brand-charcoal to-brand-emerald-dark rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-emerald-500/30 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text */}
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
              🇰🇪 Connecting All 47 Counties
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Explore Kenya by County
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Discover verified products, physical shops, and licensed technicians in your hometown. Connect directly with fast countywide courier dispatch routes.
            </p>

            {/* Quick County Picker */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-xs text-gray-400 font-bold">Quick Select:</span>
              {["Nairobi", "Mombasa", "Kiambu", "Nakuru", "Uasin Gishu", "Kisumu"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCounty(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCounty === c
                      ? "bg-brand-emerald text-white shadow-sm ring-2 ring-emerald-400/40"
                      : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10"
                  }`}
                  aria-label={`Select ${c} County`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 sm:p-7 rounded-2xl space-y-4 w-full sm:w-auto min-w-[300px] text-center shrink-0 shadow-lg">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{selectedCounty} County Commerce</span>
            </div>

            <div className="space-y-2 text-xs text-gray-200 border-y border-white/15 py-3">
              <div className="flex justify-between gap-6">
                <span>Verified County Stores:</span>
                <span className="font-bold text-white">1,200+ Active</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>Courier Transit Speed:</span>
                <span className="font-bold text-emerald-400">Same-Day / 24h</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href={`/marketplace?county=${encodeURIComponent(selectedCounty)}`}
                className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
              >
                <span>Browse {selectedCounty} Stores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/counties"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View All 47 Counties</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
