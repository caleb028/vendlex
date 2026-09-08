"use client";

import React from "react";
import Link from "next/navigation";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { formatKSh } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    deliveryCounty,
    total,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-brand-dark-card border-l border-border dark:border-brand-dark-border shadow-2xl flex flex-col transform transition-transform animate-slideLeft">
          {/* Header */}
          <div className="p-5 border-b border-border dark:border-brand-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-emerald" />
              <h2 className="text-lg font-bold text-foreground">Your VendLex Cart</h2>
              <span className="bg-brand-emerald-soft dark:bg-brand-dark-border text-brand-emerald text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted dark:hover:bg-brand-dark-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-emerald-soft dark:bg-brand-dark-border flex items-center justify-center text-brand-emerald">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Your cart is empty</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Discover verified Kenyan products, gadgets, fashion, and local goods on VendLex.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/marketplace");
                  }}
                  className="bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Explore Marketplace &rarr;
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-2xl border border-border/80 dark:border-brand-dark-border bg-muted/20 dark:bg-brand-dark-bg/40 hover:border-brand-emerald/40 transition-all"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-2">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-muted-foreground hover:text-brand-red p-1 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Seller: {item.product.businessName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border dark:border-brand-dark-border rounded-lg overflow-hidden bg-white dark:bg-brand-dark-card">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-muted dark:hover:bg-brand-dark-border text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-muted dark:hover:bg-brand-dark-border text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-brand-emerald">
                        {formatKSh(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border dark:border-brand-dark-border bg-muted/10 dark:bg-brand-dark-bg/60 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatKSh(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Delivery ({deliveryCounty})</span>
                  <span className="font-semibold text-foreground">
                    {deliveryFee === 0 ? "FREE" : formatKSh(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-border/80 dark:border-brand-dark-border pt-1.5 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Due</span>
                  <span className="text-brand-emerald text-base font-extrabold">{formatKSh(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-glow-green transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/cart");
                  }}
                  className="w-full bg-transparent hover:bg-muted dark:hover:bg-brand-dark-border text-foreground font-semibold py-2 text-xs rounded-xl transition-colors text-center"
                >
                  View Full Cart & Apply Coupons
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
