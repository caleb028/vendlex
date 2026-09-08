"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Plug,
  Megaphone,
  ShoppingBag,
  Activity,
  ArrowLeft,
} from "lucide-react";

export function AdminMarketingNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/marketing", label: "Overview & Analytics", icon: BarChart3, exact: true },
    { href: "/admin/marketing/integrations", label: "Ad Integrations", icon: Plug },
    { href: "/admin/marketing/campaigns", label: "Campaigns & Growth", icon: Megaphone },
    { href: "/admin/marketing/catalog", label: "Catalog & Feeds", icon: ShoppingBag },
    { href: "/admin/marketing/events", label: "Event Ledger", icon: Activity },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Main Admin
            </Link>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs font-bold text-brand-emerald">Marketing & Ad Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
            Google Ads, Meta Ads &amp; Attribution HQ
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-brand-emerald border border-emerald-300 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            Live Attribution Active
          </span>
        </div>
      </div>

      <nav aria-label="Marketing Hub Navigation" className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "bg-white dark:bg-brand-dark-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
