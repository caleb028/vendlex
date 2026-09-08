"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Store,
  Sparkles,
  Wrench,
  User,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/store/auth-store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, role } = useAuth();

  const isSeller = role === "SELLER" || role === "BUSINESS_OWNER";

  return (
    <>
      {/* Floating Cart Quick Access Pill (Mobile only when items in cart) */}
      {itemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-20 left-4 z-40 bg-brand-charcoal dark:bg-brand-dark-card text-white font-bold py-2.5 px-4 rounded-full shadow-2xl flex items-center gap-2 border border-brand-gold/40 animate-bounce-subtle"
          aria-label="Open Cart Drawer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-charcoal text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          </div>
          <span className="text-xs">View Cart</span>
        </button>
      )}

      {/* Primary Mobile Navigation: Home | Shop | Sell | Services | Account */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-brand-dark-card/95 backdrop-blur-md border-t border-border dark:border-brand-dark-border shadow-2xl py-1 px-1 flex items-center justify-around"
        aria-label="Mobile Bottom Navigation"
      >
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-colors ${
            pathname === "/"
              ? "text-brand-emerald dark:text-brand-emerald-light font-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/marketplace"
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-colors ${
            pathname.startsWith("/marketplace")
              ? "text-brand-emerald dark:text-brand-emerald-light font-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Shop</span>
        </Link>

        {/* 3. Sell */}
        <Link
          href={isSeller ? "/seller/dashboard" : "/seller/onboarding"}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-colors ${
            pathname.startsWith("/seller")
              ? "text-brand-gold font-black"
              : "text-muted-foreground hover:text-brand-gold"
          }`}
        >
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <span className="text-[10px] font-bold mt-0.5">Sell</span>
        </Link>

        {/* 4. Services */}
        <Link
          href="/services"
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-colors ${
            pathname.startsWith("/services")
              ? "text-brand-emerald dark:text-brand-emerald-light font-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Services</span>
        </Link>

        {/* 5. Account */}
        <Link
          href={user ? "/customer/dashboard" : "/login"}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-colors ${
            pathname.startsWith("/customer") || pathname.startsWith("/login")
              ? "text-brand-emerald dark:text-brand-emerald-light font-black"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Account</span>
        </Link>
      </nav>
    </>
  );
}
