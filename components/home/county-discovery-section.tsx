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
        <div className="bg-gradient-to-br from-gray-950 via-brand-charcoal to-brand-emerald-dark rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-emerald-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <span>🇰🇪 Connecting All 47 Counties</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Explore Kenya by County
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
              Discover verified products, physical shops, and licensed technicians in your hometown. Connect directly with fast countywide courier dispatch routes.
            </p>

            {/* Quick County Picker with ample gaps */}
            <div className="pt-2 space-y-2">
              <span className="text-xs text-gray-400 font-bold block">Quick County Filter:</span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {["Nairobi", "Mombasa", "Kiambu", "Nakuru", "Uasin Gishu", "Kisumu", "Machakos", "Kilifi"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCounty(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCounty === c
                        ? "bg-brand-emerald text-white shadow-md ring-2 ring-emerald-400/50"
                        : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10"
                    }`}
                    aria-label={`Select ${c} County`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Action Box (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-7 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-amber-300 font-bold text-xs border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm font-black">{selectedCounty} County</span>
              </div>
              <span className="text-[10px] uppercase font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                Active Zone
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-gray-200 py-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Verified Stores:</span>
                <span className="font-bold text-white">1,200+ Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Courier Dispatch Speed:</span>
                <span className="font-bold text-emerald-400">Same-Day / 24h Transit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Lipa na M-Pesa:</span>
                <span className="font-bold text-white">100% Escrow Secured</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <Link
                href={`/marketplace?county=${encodeURIComponent(selectedCounty)}`}
                className="w-full bg-brand-emerald hover:bg-emerald-600 text-white font-black py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
              >
                <span>Browse {selectedCounty} Stores</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/counties"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Explore All 47 Counties Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
