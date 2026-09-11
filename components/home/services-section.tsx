"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Droplets,
  Sun,
  Smartphone,
  Laptop,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const POPULAR_SERVICES = [
  {
    name: "Electrician",
    query: "electrician",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
    prosCount: "120+ Verified Pros",
    tag: "Wiring & Power",
  },
  {
    name: "Plumber",
    query: "plumber",
    icon: Droplets,
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
    prosCount: "95+ Verified Pros",
    tag: "Piping & Drainage",
  },
  {
    name: "Solar Technician",
    query: "solar",
    icon: Sun,
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=600&auto=format&fit=crop",
    prosCount: "70+ Verified Pros",
    tag: "PV Panels & Inverters",
  },
  {
    name: "Phone Repair",
    query: "phone repair",
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?q=80&w=600&auto=format&fit=crop",
    prosCount: "150+ Verified Pros",
    tag: "Screens & Motherboards",
  },
  {
    name: "Computer Repair",
    query: "computer repair",
    icon: Laptop,
    image: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=600&auto=format&fit=crop",
    prosCount: "80+ Verified Pros",
    tag: "Laptops & Hardware",
  },
  {
    name: "Mechanic",
    query: "mechanic",
    icon: Wrench,
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop",
    prosCount: "110+ Verified Pros",
    tag: "Auto Diagnostics",
  },
];

export function ServicesSection() {
  return (
    <section className="py-14 sm:py-20 bg-brand-off-white dark:bg-brand-dark-bg border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-brand-emerald dark:text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Local Trades &amp; Pros</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              What service do you need?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Connect with verified technicians, engineers, and artisans across all 47 counties.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <span>View All 10+ Trades</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6-Item Popular Categories Grid with Photographic Images */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {POPULAR_SERVICES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={`/services?search=${encodeURIComponent(item.query)}`}
                className="group bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-brand-emerald/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
              >
                {/* Photographic Header */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Floating Icon Pill */}
                  <div className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-amber-400 border border-white/20 shadow-sm">
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <span className="absolute bottom-2 left-2.5 text-[10px] text-white font-bold drop-shadow-xs bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {item.tag}
                  </span>
                </div>

                {/* Body */}
                <div className="p-3.5 text-center space-y-0.5">
                  <span className="text-xs font-bold text-foreground group-hover:text-brand-emerald transition-colors block truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    {item.prosCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
