"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/lib/store/wishlist-store";
import { ProductCard } from "@/components/marketplace/product-card";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-brand-red fill-current" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">Saved Wishlist</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep track of favorite products and receive flash price reduction alerts.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 text-brand-red flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-foreground">Your Wishlist is Empty</h3>
            <p className="text-xs text-muted-foreground">Save items while browsing the marketplace to view them here later.</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-brand-emerald text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
