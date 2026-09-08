"use client";

import React, { useState, useEffect } from "react";
import { formatKSh } from "@/lib/utils";
import { Users, Search, MessageCircle, Phone, Mail, ShoppingBag, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  county: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchase: string;
  lastItem: string;
}

export default function SellerCustomersPage() {
  const { user, isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCustomersFromOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // Aggregate by customerPhone or customerName
          const map = new Map<string, CustomerRecord>();

          data.orders.forEach((ord: any) => {
            const key = ord.customerPhone || ord.customerName || ord.customerId;
            const existing = map.get(key);
            const ordDate = new Date(ord.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const firstItemTitle = ord.items?.[0]?.title || ord.items?.[0]?.productTitle || "Marketplace item";

            if (existing) {
              existing.totalOrders += 1;
              existing.totalSpent += ord.total || 0;
            } else {
              map.set(key, {
                id: ord.customerId || `cust-${Math.random().toString(36).substr(2, 6)}`,
                name: ord.customerName || "Customer",
                phone: ord.customerPhone || "+254 700 000 000",
                email: ord.customerEmail || "customer@vendlex.co.ke",
                county: `${ord.county || "Nairobi"} (${ord.town || "CBD"})`,
                totalOrders: 1,
                totalSpent: ord.total || 0,
                lastPurchase: ordDate,
                lastItem: firstItemTitle,
              });
            }
          });

          setCustomers(Array.from(map.values()));
        }
      } catch (err) {
        console.warn("Failed to load customers from orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomersFromOrders();
  }, [isAuthenticated]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.county.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Customer Relationship Management (CRM)</h1>
        <p className="text-xs text-muted-foreground">Directory of buyers who have purchased from your storefront. Re-engage with WhatsApp promotions.</p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, phone, or location..."
            className="w-full bg-muted/40 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
          />
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          {filtered.length} Active Buyers
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center gap-2 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8">
          <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
          <span>Aggregating customer directory...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 space-y-2">
          <Users className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
          <p className="font-bold">No customer records yet.</p>
          <p className="text-[11px]">Customers who complete purchases from your store will be listed here automatically.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Phone &amp; Email</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Total Orders</th>
                  <th className="pb-3">Lifetime Value</th>
                  <th className="pb-3">Last Purchase</th>
                  <th className="pb-3 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 font-bold text-foreground">{c.name}</td>
                    <td className="py-3.5">
                      <div className="font-mono text-foreground">{c.phone}</div>
                      <div className="text-[10px] text-muted-foreground">{c.email}</div>
                    </td>
                    <td className="py-3.5 text-muted-foreground">{c.county}</td>
                    <td className="py-3.5 font-semibold text-foreground">{c.totalOrders} order{c.totalOrders > 1 ? "s" : ""}</td>
                    <td className="py-3.5 font-black text-brand-emerald">{formatKSh(c.totalSpent)}</td>
                    <td className="py-3.5 text-muted-foreground">
                      <div>{c.lastPurchase}</div>
                      <div className="text-[10px] truncate max-w-[140px]">{c.lastItem}</div>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(c.name)},%20special%20offer%20for%20you%20from%20${encodeURIComponent(user?.businessName || "our store")}!`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${c.phone}`}
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
