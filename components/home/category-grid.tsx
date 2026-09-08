import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data/kenya-data";
import {
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  Home,
  Tv,
  Sparkles,
  Armchair,
  Utensils,
  Wrench,
  Truck,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  Home,
  Tv,
  Sparkles,
  Armchair,
  Utensils,
  Wrench,
  Truck,
  Briefcase,
};

export function CategoryGrid() {
  return (
    <section className="py-16 bg-brand-off-white dark:bg-brand-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-brand-emerald dark:text-brand-emerald-light uppercase tracking-wider">
              Browse by Department
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Explore Popular Categories
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.id}`}
                className="group relative bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-sm hover:shadow-card-hover hover:border-brand-emerald/50 card-elevated flex flex-col"
              >
                {/* Category Image */}
                <div className="relative h-28 w-full overflow-hidden bg-muted">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-112"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Floating Icon with Micro-tilt on hover */}
                  <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg bg-white/95 dark:bg-brand-dark-card/95 backdrop-blur-sm text-brand-emerald flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Item count badge */}
                  <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {cat.productCount}+ items
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-brand-emerald transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {cat.businessCount} Kenyan Stores
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
