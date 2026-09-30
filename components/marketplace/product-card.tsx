"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { Star, Heart, Check, ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-brand-emerald/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative">
      {/* 1. Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        <Link href={`/products/${product.slug}`} className="block w-full h-full" tabIndex={-1}>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button: Accessible touch target >= 44x44px equivalent hover area */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full backdrop-blur-md transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald ${
            inWishlist
              ? "bg-white text-brand-red shadow-sm scale-105"
              : "bg-white/80 dark:bg-black/60 text-muted-foreground hover:text-brand-red hover:bg-white"
          }`}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current text-brand-red" : ""}`} />
        </button>

        {/* Badges: Discount percentage */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.discountPercentage && (
            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* 2. Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Seller & Verified Status */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate max-w-[70%] font-medium">
              {product.businessName}
            </span>
            {product.businessVerified && (
              <span className="text-[10px] font-bold text-brand-emerald dark:text-emerald-400 shrink-0 flex items-center gap-0.5">
                <span>✓</span> Verified
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-xs sm:text-sm text-foreground group-hover:text-brand-emerald transition-colors line-clamp-2 leading-snug focus-visible:outline-none focus-visible:underline"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Rating & Location */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-current mr-1" />
              <span className="text-[11px] font-bold">{product.rating}</span>
              <span className="text-[10px] text-muted-foreground ml-1">({product.reviewCount})</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{product.county}</span>
          </div>
        </div>

        {/* 3. Pricing & Primary CTA */}
        <div className="pt-2 border-t border-border/60 dark:border-brand-dark-border/60 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-sm sm:text-base font-black text-brand-emerald dark:text-emerald-400">
              {formatKSh(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatKSh(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald ${
              isAdded
                ? "bg-emerald-700 text-white"
                : "bg-brand-emerald hover:bg-brand-emerald-dark text-white active:scale-98"
            }`}
            aria-label={`Add ${product.title} to cart`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added to Cart ✓</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
