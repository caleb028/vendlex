"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import {
  LayoutDashboard,
  Store,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  FileText,
  Percent,
  Megaphone,
  BarChart3,
  Bot,
  CreditCard,
  Settings,
  Star,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: `/businesses/${user?.businessSlug || "nairobi-tech-hub"}`, label: "My Public Store", icon: Store, external: true },
    { href: "/seller/products", label: "Products", icon: Package },
    { href: "/seller/inventory", label: "Inventory Tracker", icon: Boxes },
    { href: "/seller/orders", label: "Orders & Delivery", icon: ShoppingBag, badge: "3 New" },
    { href: "/seller/customers", label: "Customers CRM", icon: Users },
    { href: "/seller/invoices", label: "Invoices & KRA", icon: FileText },
    { href: "/seller/promotions", label: "Promotions & Deals", icon: Percent },
    { href: "/seller/marketing", label: "Marketing (Grow)", icon: Megaphone, badge: "Ad Hub" },
    { href: "/seller/analytics", label: "Analytics & Sales", icon: BarChart3 },
    { href: "/seller/ai", label: "VendLex AI Assistant", icon: Bot, isSpecial: true },
    { href: "/seller/subscription", label: "Subscription Plan", icon: CreditCard },
    { href: "/seller/settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-brand-dark-bg flex flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white dark:bg-brand-dark-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-border text-foreground"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm text-foreground">
            {user?.businessName || "Seller Portal"}
          </span>
        </div>
        <span className="text-xs bg-brand-emerald-soft text-brand-emerald px-2.5 py-0.5 rounded-full font-bold">
          ✓ Verified Store
        </span>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 inset-y-0 left-0 z-40 w-64 bg-white dark:bg-brand-dark-card border-r border-border dark:border-brand-dark-border p-5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Store Info Header */}
          <div className="p-3 bg-brand-emerald-soft/40 dark:bg-brand-dark-bg/60 rounded-2xl border border-brand-emerald/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"}
                alt="Store"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-foreground truncate">
                {user?.businessName || "Nairobi Tech Hub"}
              </h4>
              <p className="text-[10px] text-brand-emerald font-semibold flex items-center gap-1">
                <span>Business Plan</span> • <span>Active</span>
              </p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-emerald text-white shadow-sm"
                      : item.isSpecial
                      ? "text-brand-gold-dark dark:text-brand-gold-light hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-brand-dark-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-brand-red text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.external && <ExternalLink className="w-3 h-3 opacity-60" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support & Quick Action */}
        <div className="pt-4 border-t border-border/80 text-[11px] text-muted-foreground space-y-2">
          <div className="flex items-center justify-between">
            <span>24/7 Seller Support</span>
            <span className="text-brand-emerald font-bold">Online</span>
          </div>
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noreferrer"
            className="block text-center bg-muted dark:bg-brand-dark-border hover:bg-muted/80 text-foreground py-2 rounded-xl font-bold transition-colors"
          >
            WhatsApp Support &rarr;
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
    </div>
  );
}
