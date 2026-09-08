"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_BUSINESSES, KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import { BusinessCard } from "../businesses/business-card";
import { MapPin, Navigation, ArrowRight } from "lucide-react";

export function NearbyBusinesses() {
  const [selectedCounty, setSelectedCounty] = useState("Nairobi");

  const filtered = MOCK_BUSINESSES.filter(
    (b) => b.county.toLowerCase() === selectedCounty.toLowerCase()
  );

  // If no businesses in that county in mock, fallback to first 2 to keep UI gorgeous
  const displayBusinesses = filtered.length > 0 ? filtered : MOCK_BUSINESSES.slice(0, 3);

  const topCounties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Uasin Gishu (Eldoret)"];

  return (
    <section className="py-16 bg-white dark:bg-brand-dark-card border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald uppercase tracking-wider mb-1">
              <Navigation className="w-3.5 h-3.5" />
              <span>Location-Based Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Businesses Near You in {selectedCounty}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Connect with reputable local shops, artisans, repair centres, and service providers in your neighborhood.
            </p>
          </div>

          {/* Quick County Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 dark:bg-brand-dark-bg/60 p-1.5 rounded-2xl border border-border">
            {topCounties.map((county) => {
              const isSelected = selectedCounty === county;
              return (
                <button
                  key={county}
                  onClick={() => setSelectedCounty(county)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-brand-emerald text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-brand-dark-border"
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  <span>{county.replace(" (Eldoret)", "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Businesses List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {/* Directory CTA */}
        <div className="mt-8 p-4 rounded-2xl bg-brand-emerald-soft/50 dark:bg-brand-dark-bg/40 border border-brand-emerald/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 text-brand-emerald flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span>
              Looking for businesses in another county? VendLex covers all 47 counties in Kenya.
            </span>
          </div>
          <Link
            href="/businesses"
            className="text-xs font-bold text-brand-emerald hover:underline shrink-0 flex items-center gap-1"
          >
            <span>Open County Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
