"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Store, Wrench, Package } from "lucide-react";
import { KENYAN_COUNTIES } from "@/lib/data/kenya-data";

export function CountyDiscoverySection() {
  const [selectedCounty, setSelectedCounty] = useState("Nairobi");

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-brand-dark-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-950 via-gray-900 to-brand-charcoal rounded-3xl p-8 sm:p-12 text-white shadow-lg border border-emerald-500/20 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text */}
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
              🇰🇪 Connecting All 47 Counties
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Explore Kenya
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Discover products and businesses near you. Connect with local merchants, fast courier delivery routes, and verified technicians across all counties.
            </p>

            {/* Quick County Picker */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-xs text-gray-400 font-medium">Quick Select:</span>
              {["Nairobi", "Mombasa", "Kiambu", "Nakuru", "Uasin Gishu", "Kisumu"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCounty(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedCounty === c
                      ? "bg-brand-emerald text-white"
                      : "bg-white/10 hover:bg-white/20 text-gray-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Box per Section 16 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl space-y-4 w-full sm:w-auto min-w-[280px] text-center shrink-0">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
              <MapPin className="w-4 h-4" />
              <span>{selectedCounty} County Active</span>
            </div>

            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between gap-6">
                <span>Verified Stores:</span>
                <span className="font-bold text-white">1,200+</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>Delivery:</span>
                <span className="font-bold text-emerald-400">Same-Day / 24h</span>
              </div>
            </div>

            <Link
              href="/counties"
              className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <span>Explore Counties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
