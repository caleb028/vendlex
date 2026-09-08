"use client";

import React, { useState, useEffect } from "react";
import { formatKSh } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, ShoppingBag, Loader2, Package, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";
import { Product } from "@/lib/data/kenya-data";

interface ProductSalesStat {
  name: string;
  sales: number;
  revenue: number;
}

export default function SellerAnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        if (ordersData.success && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        }
        if (productsData.success && Array.isArray(productsData.products)) {
          const merchantProds = productsData.products.filter(
            (p: Product) =>
              !user?.businessId ||
              p.businessId === user.businessId ||
              p.businessSlug === user.businessSlug ||
              (user.businessName && p.businessName.toLowerCase() === user.businessName.toLowerCase())
          );
          setProducts(merchantProds.length > 0 ? merchantProds : productsData.products);
        }
      } catch (e) {
        console.warn("Failed to load live seller analytics:", e);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [isAuthenticated, user?.businessId]);

  // Aggregate live metrics
  const grossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.customerPhone || o.customerId)).size;
  const repeatRate = totalOrders > 0 && uniqueCustomers > 0
    ? Math.round(((totalOrders - uniqueCustomers) / totalOrders) * 100)
    : 0;

  // Aggregate product performance from live order items
  const productSalesMap = new Map<string, ProductSalesStat>();
  orders.forEach((ord) => {
    (ord.items || []).forEach((item: any) => {
      const title = item.title || item.productTitle || "Marketplace Product";
      const qty = item.quantity || item.qty || 1;
      const itemRev = (item.price || 0) * qty;

      const existing = productSalesMap.get(title);
      if (existing) {
        existing.sales += qty;
        existing.revenue += itemRev;
      } else {
        productSalesMap.set(title, {
          name: title,
          sales: qty,
          revenue: itemRev,
        });
      }
    });
  });

  const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Commerce Analytics &amp; Reports</h1>
        <p className="text-xs text-muted-foreground">
          Real-time performance metrics computed directly from your live store catalog and verified customer orders.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground flex justify-center items-center gap-2 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8">
          <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
          <span>Calculating live store analytics...</span>
        </div>
      ) : (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gross Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-brand-emerald">{formatKSh(grossRevenue)}</div>
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand-emerald" />
                <span>{totalOrders > 0 ? `${totalOrders} live orders processed` : "0 orders processed"}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Order Value (AOV)</span>
              <div className="text-2xl sm:text-3xl font-black text-foreground">{formatKSh(aov)}</div>
              <div className="text-xs text-muted-foreground font-semibold">
                {totalOrders > 0 ? `Computed across ${totalOrders} order${totalOrders > 1 ? "s" : ""}` : "Awaiting first order"}
              </div>
            </div>

            <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unique Customers</span>
              <div className="text-2xl sm:text-3xl font-black text-foreground">{uniqueCustomers}</div>
              <div className="text-xs text-brand-emerald font-semibold">
                {repeatRate > 0 ? `${repeatRate}% repeat buyer rate` : "Direct customer acquisitions"}
              </div>
            </div>
          </div>

          {/* Top Products Breakdown */}
          <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-foreground">Product Sales Performance</h3>
              <span className="text-xs text-muted-foreground">{products.length} products in store catalog</span>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <Package className="w-8 h-8 mx-auto text-muted-foreground opacity-40 mb-2" />
                <p className="font-bold">No product sales recorded yet.</p>
                <p className="text-[11px]">When customers order items from your storefront, sales and revenue will populate here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Product Name</th>
                      <th className="pb-3">Units Sold</th>
                      <th className="pb-3">Total Gross Revenue</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {topProducts.map((prod, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="py-3 font-bold text-foreground">{prod.name}</td>
                        <td className="py-3 font-semibold text-foreground">{prod.sales} unit{prod.sales > 1 ? "s" : ""}</td>
                        <td className="py-3 font-black text-brand-emerald">{formatKSh(prod.revenue)}</td>
                        <td className="py-3 font-bold text-emerald-600">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
