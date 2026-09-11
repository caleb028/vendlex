"use client";

import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-card animate-pulse flex flex-col justify-between">
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-muted/60 dark:bg-muted/20 relative" />

      {/* Card Body Skeleton */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Seller / Location Line */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-muted/70 dark:bg-muted/30 rounded-md" />
            <div className="h-3 w-12 bg-muted/70 dark:bg-muted/30 rounded-md" />
          </div>

          {/* Title Lines */}
          <div className="h-3.5 w-full bg-muted/80 dark:bg-muted/40 rounded-md" />
          <div className="h-3.5 w-3/4 bg-muted/80 dark:bg-muted/40 rounded-md" />

          {/* Rating */}
          <div className="flex items-center gap-1 pt-1">
            <div className="h-3 w-14 bg-muted/70 dark:bg-muted/30 rounded-md" />
          </div>
        </div>

        {/* Pricing & Button Skeleton */}
        <div className="pt-2 border-t border-border/50 dark:border-brand-dark-border/50 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="h-4 w-24 bg-muted/90 dark:bg-muted/50 rounded-md" />
            <div className="h-3 w-12 bg-muted/60 dark:bg-muted/20 rounded-md" />
          </div>
          <div className="h-9 w-full bg-muted/80 dark:bg-muted/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
