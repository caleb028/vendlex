"use client";

import React from "react";
import Link from "next/link";
import { Business } from "@/lib/data/kenya-data";
import { MapPin, Star, ArrowRight } from "lucide-react";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <div className="group bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-brand-emerald/40 transition-all duration-300 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header: Logo/Avatar & Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-muted shrink-0">
            <img
              src={business.logo}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-foreground group-hover:text-brand-emerald transition-colors truncate">
                {business.name}
              </h3>
              {business.isVerified && (
                <span className="text-[10px] font-bold text-brand-emerald dark:text-brand-emerald-light bg-brand-emerald/10 dark:bg-brand-emerald/20 px-1.5 py-0.5 rounded shrink-0">
                  ✓ Verified
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 text-brand-emerald shrink-0" />
              <span className="truncate">{business.town}, {business.county}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center text-xs text-amber-500 font-semibold pt-1">
          <Star className="w-3.5 h-3.5 fill-current mr-1" />
          <span>{business.rating}</span>
          <span className="text-muted-foreground font-normal ml-1">({business.reviewCount})</span>
        </div>
      </div>

      {/* Primary Action: View Store per Section 14 */}
      <div className="pt-4 mt-2 border-t border-border/50">
        <Link
          href={`/businesses/${business.slug}`}
          className="w-full bg-brand-emerald-soft dark:bg-brand-dark-border hover:bg-brand-emerald hover:text-white text-brand-emerald font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <span>View Store</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
