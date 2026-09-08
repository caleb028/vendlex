"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/data/kenya-data";
import { Modal } from "@/components/ui/modal";
import { formatKSh } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { VerifiedBadge } from "@/components/ui/badge";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Plus,
  Minus,
  MessageCircle,
} from "lucide-react";

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
            <img
              src={product.images[selectedImg] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage && (
              <span className="absolute top-3 left-3 bg-brand-red text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImg === i
                      ? "border-brand-emerald shadow-sm scale-105"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            {/* Category & Seller */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{product.category}</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                <span>{product.town}, {product.county}</span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {product.title}
            </h2>

            {/* Seller info */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Sold by:</span>
              <Link
                href={`/businesses/${product.businessSlug}`}
                onClick={onClose}
                className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
              >
                <span>{product.businessName}</span>
                {product.businessVerified && <VerifiedBadge />}
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating)
                        ? "fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-4 p-3 rounded-xl bg-brand-emerald-soft/40 dark:bg-brand-dark-bg/60 border border-brand-emerald/20 flex items-baseline gap-3">
              <span className="text-2xl font-black text-brand-emerald">
                {formatKSh(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatKSh(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Delivery Note */}
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Truck className="w-4 h-4 text-brand-emerald shrink-0" />
              <span>{product.deliveryInfo}</span>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-foreground">Quantity:</span>
              <div className="flex items-center border border-border dark:border-brand-dark-border rounded-xl bg-muted/40 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock ({product.stockCount} left)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedToast ? "Added to Cart ✓" : "Add to Cart"}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-colors ${
                  inWishlist
                    ? "bg-red-50 border-red-200 text-brand-red dark:bg-red-950/50"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-brand-red"
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="text-brand-emerald font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Complete Specifications & Reviews</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
