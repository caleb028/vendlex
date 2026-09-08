"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart-store";
import { formatKSh } from "@/lib/utils";
import { KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    deliveryCounty,
    setDeliveryCounty,
    promoCode,
    discountAmount,
    total,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const ok = applyPromoCode(inputCode);
    if (ok) {
      setPromoSuccess(true);
      setInputCode("");
    } else {
      setPromoError("Invalid code. Try 'KARIBU10' or 'GROW20'.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-brand-emerald-soft dark:bg-brand-dark-border text-brand-emerald flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-foreground">Your VendLex Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore thousands of genuine electronics, handcrafted African fashion, and local products from verified Kenyan sellers.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your items and select delivery county
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-brand-red hover:underline font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted border shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-bold text-brand-emerald block">
                      {item.product.category}
                    </span>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-xs sm:text-sm font-bold text-foreground hover:text-brand-emerald line-clamp-2"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Sold by: <span className="font-semibold text-foreground">{item.product.businessName}</span> ({item.product.county})
                    </p>
                    <div className="text-xs font-black text-brand-emerald sm:hidden pt-1">
                      {formatKSh(item.product.price)}
                    </div>
                  </div>
                </div>

                {/* Price, Quantity, Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-black text-brand-emerald">
                      {formatKSh(item.product.price * item.quantity)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatKSh(item.product.price)} each
                    </div>
                  </div>

                  <div className="flex items-center border border-border rounded-xl bg-muted/30 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-muted-foreground hover:text-brand-red p-2"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & County Calculator (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-base text-foreground border-b border-border pb-3">
                Order Summary ({itemCount} {itemCount === 1 ? "Item" : "Items"})
              </h3>

              {/* Delivery County Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Delivery Destination</span>
                  <span className="text-brand-emerald">{deliveryCounty}</span>
                </label>
                <select
                  value={deliveryCounty}
                  onChange={(e) => setDeliveryCounty(e.target.value)}
                  className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald font-semibold"
                >
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Free delivery on orders over KSh 50,000.
                </p>
              </div>

              {/* Promo Code Input */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>Promo / Discount Code</span>
                </label>

                {promoCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs">
                    <span className="font-bold text-brand-emerald">Code: {promoCode}</span>
                    <button
                      onClick={removePromoCode}
                      className="text-xs text-brand-red hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="e.g. KARIBU10"
                      className="flex-1 bg-muted/40 dark:bg-brand-dark-bg/60 border border-border rounded-xl px-3 py-2 text-xs text-foreground uppercase focus:outline-none focus:border-brand-emerald font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[11px] text-brand-red">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-emerald-600 font-semibold">Coupon applied successfully!</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatKSh(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand-red font-semibold">
                    <span>Discount</span>
                    <span>-{formatKSh(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery ({deliveryCounty})</span>
                  <span className="font-semibold text-foreground">
                    {deliveryFee === 0 ? "FREE" : formatKSh(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Amount</span>
                  <span className="text-brand-emerald text-lg font-black">{formatKSh(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-4 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-green transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                <span>Protected by VendLex M-Pesa Escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
