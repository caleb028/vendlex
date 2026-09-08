"use client";

import React, { useState } from "react";
import { MapPin, TrendingUp, Sparkles, Filter, ShieldAlert } from "lucide-react";
import { formatKSh } from "@/lib/utils";

interface CountyHeatData {
  county: string;
  intensity: "CRITICAL" | "HIGH" | "MEDIUM";
  topCategory: string;
  weeklyDemandVolume: number;
  activeSellers: number;
  growthRate: string;
}

const COUNTY_HEATMAP_DATA: CountyHeatData[] = [
  { county: "Nairobi", intensity: "CRITICAL", topCategory: "Phones & Electronics", weeklyDemandVolume: 1840000, activeSellers: 340, growthRate: "+42%" },
  { county: "Mombasa", intensity: "HIGH", topCategory: "Fashion & Apparel", weeklyDemandVolume: 920000, activeSellers: 180, growthRate: "+31%" },
  { county: "Kiambu", intensity: "HIGH", topCategory: "Home & Appliances", weeklyDemandVolume: 780000, activeSellers: 145, growthRate: "+28%" },
  { county: "Nakuru", intensity: "HIGH", topCategory: "Solar & Power Systems", weeklyDemandVolume: 650000, activeSellers: 110, growthRate: "+25%" },
  { county: "Uasin Gishu (Eldoret)", intensity: "HIGH", topCategory: "Agri-Tech & Tools", weeklyDemandVolume: 590000, activeSellers: 95, growthRate: "+34%" },
  { county: "Kisumu", intensity: "MEDIUM", topCategory: "Electronics & Tech", weeklyDemandVolume: 480000, activeSellers: 82, growthRate: "+20%" },
  { county: "Machakos", intensity: "MEDIUM", topCategory: "Construction & Hardware", weeklyDemandVolume: 410000, activeSellers: 70, growthRate: "+18%" },
  { county: "Kajiado", intensity: "MEDIUM", topCategory: "Leather & Crafts", weeklyDemandVolume: 350000, activeSellers: 65, growthRate: "+22%" },
];

export function AICountyHeatmap() {
  const [selectedCounty, setSelectedCounty] = useState<CountyHeatData>(COUNTY_HEATMAP_DATA[0]);

  return (
    <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Real-Time Analytics Engine</span>
          </div>
          <h3 className="text-xl font-black text-foreground">
            47 Kenyan Counties Demand Heatmap
          </h3>
          <p className="text-xs text-muted-foreground">AI-driven regional demand intensity, trending categories &amp; buyer search volume.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            High Demand
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200">
            Growth Sector
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Heatmap List Grid */}
        <div className="lg:col-span-2 space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {COUNTY_HEATMAP_DATA.map((item) => {
            const isSelected = selectedCounty.county === item.county;
            return (
              <div
                key={item.county}
                onClick={() => setSelectedCounty(item)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-brand-emerald-soft/50 dark:bg-brand-dark-bg border-brand-emerald shadow-sm"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      item.intensity === "CRITICAL"
                        ? "bg-red-500 animate-pulse"
                        : item.intensity === "HIGH"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <div>
                    <span className="font-bold text-sm text-foreground">{item.county}</span>
                    <span className="text-xs text-muted-foreground block">Top Demand: {item.topCategory}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-brand-emerald">{formatKSh(item.weeklyDemandVolume)}/wk</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{item.growthRate} Growth</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected County Deep Insight Card */}
        <div className="bg-gradient-to-br from-brand-charcoal to-gray-900 text-white rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-emerald" />
              <h4 className="font-extrabold text-base">{selectedCounty.county} Insight</h4>
            </div>
            <span className="text-[10px] bg-brand-gold text-brand-charcoal px-2 py-0.5 rounded font-black">
              {selectedCounty.intensity}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Weekly Buyer Volume:</span>
              <span className="font-bold text-emerald-400">{formatKSh(selectedCounty.weeklyDemandVolume)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Active Verified Stores:</span>
              <span className="font-bold text-white">{selectedCounty.activeSellers} Stores</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Trending Category:</span>
              <span className="font-bold text-amber-300">{selectedCounty.topCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MoM Demand Growth:</span>
              <span className="font-bold text-emerald-400">{selectedCounty.growthRate}</span>
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-xl text-[11px] text-gray-300 leading-relaxed">
            💡 <strong className="text-white">AI Seller Tip:</strong> Increasing inventory for <span className="text-amber-300 font-bold">{selectedCounty.topCategory}</span> in {selectedCounty.county} is projected to boost store revenue by 35% this month.
          </div>
        </div>
      </div>
    </div>
  );
}
