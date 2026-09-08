"use client";

import React from "react";
import { formatKSh } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, ShoppingBag, Eye, ArrowUpRight, DollarSign } from "lucide-react";

export default function SellerAnalyticsPage() {
  const topProducts = [
    { name: "Samsung Galaxy S24 Ultra (512GB)", sales: 18, revenue: 2789982, growth: "+34%" },
    { name: "Apple MacBook Pro 14 M3 Pro", sales: 7, revenue: 1959993, growth: "+18%" },
    { name: "NutriCook 8.5L Dual Air Fryer", sales: 34, revenue: 560966, growth: "+45%" },
    { name: "Sony Bravia 55-inch 4K Google TV", sales: 12, revenue: 827988, growth: "+22%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Commerce Analytics & Reports</h1>
        <p className="text-xs text-muted-foreground">In-depth performance metrics, top bestselling products, and traffic sources across Kenya.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gross Revenue (YTD)</span>
          <div className="text-2xl sm:text-3xl font-black text-brand-emerald">{formatKSh(3840000)}</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +32% vs last year
          </div>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Order Value (AOV)</span>
          <div className="text-2xl sm:text-3xl font-black text-foreground">{formatKSh(48250)}</div>
          <div className="text-xs text-blue-600 font-semibold">+KSh 4,200 higher with bundle promotions</div>
        </div>

        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Repeat Customer Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-foreground">34.2%</div>
          <div className="text-xs text-purple-600 font-semibold">Driven by WhatsApp re-orders</div>
        </div>
      </div>

      {/* Top Products Breakdown */}
      <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-foreground">Top Bestselling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Units Sold</th>
                <th className="pb-3">Total Gross Revenue</th>
                <th className="pb-3">MoM Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {topProducts.map((prod, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="py-3 font-bold text-foreground">{prod.name}</td>
                  <td className="py-3 font-semibold text-foreground">{prod.sales} units</td>
                  <td className="py-3 font-black text-brand-emerald">{formatKSh(prod.revenue)}</td>
                  <td className="py-3 font-bold text-emerald-600">{prod.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
