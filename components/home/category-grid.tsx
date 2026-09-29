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
    <section className="py-14 sm:py-20 bg-brand-off-white dark:bg-brand-dark-bg border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black text-brand-emerald dark:text-emerald-400 uppercase tracking-wider">
              Browse by Department
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Explore Popular Categories
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-emerald hover:text-brand-emerald-dark transition-colors focus-visible:outline-none focus-visible:underline"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid - Generous spacing, un-squeezed card aspect ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/marketplace?category=${cat.id}`}
                className="group relative bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-xs hover:shadow-card-hover hover:border-brand-emerald/50 hover:-translate-y-1 transition-all duration-300 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
              >
                {/* Category Image Container with comfortable height and clean overlay */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Floating Icon */}
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/95 dark:bg-brand-dark-card/95 backdrop-blur-md text-brand-emerald dark:text-emerald-400 flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  {/* Item Count Badge */}
                  <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                    {cat.productCount}+ items
                  </span>
                </div>

                {/* Card Text Content with ample padding */}
                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-foreground group-hover:text-brand-emerald transition-colors line-clamp-1 leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 font-medium">
                      {cat.businessCount} Kenyan Stores
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
