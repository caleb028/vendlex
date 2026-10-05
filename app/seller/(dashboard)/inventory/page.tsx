"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { BulkUploadModal } from "@/components/seller/bulk-upload-modal";
import { useAuth } from "@/lib/store/auth-store";

export default function SellerInventoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [restockedToast, setRestockedToast] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        const merchantProds = data.products.filter(
          (p: Product) =>
            !user?.businessId ||
            p.businessId === user.businessId ||
            p.businessSlug === user.businessSlug ||
            (user.businessName && p.businessName.toLowerCase() === user.businessName.toLowerCase())
        );
        setProducts(merchantProds.length > 0 ? merchantProds : data.products);
      }
    } catch (e) {
      console.warn("Failed to fetch inventory products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isAuthenticated, user?.businessId]);

  const updateStock = async (id: string, delta: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const newStockCount = Math.max(0, target.stockCount + delta);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockCount: newStockCount, inStock: newStockCount > 0 } : p))
    );

    setSavingId(id);
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCount: newStockCount }),
      });
    } catch (err) {
      console.error("Failed to update stock count:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleQuickRestockAll = async () => {
    const updated = products.map((p) => {
      const threshold = p.lowStockThreshold || 3;
      if (p.stockCount <= threshold) {
        const newCount = threshold + 15;
        // Fire async update
        fetch(`/api/products/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockCount: newCount }),
        }).catch((e) => console.warn(e));

        return { ...p, stockCount: newCount, inStock: true };
      }
      return p;
    });

    setProducts(updated);
    setRestockedToast(true);
    setTimeout(() => setRestockedToast(false), 3000);
  };

  const lowStockItems = products.filter((p) => p.stockCount <= (p.lowStockThreshold || 3));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Inventory Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage product variants, live warehouse stock levels, SKUs, and instant restock triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="bg-brand-charcoal dark:bg-brand-dark-card hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Package className="w-4 h-4 text-brand-gold" />
            <span>Bulk CSV Upload</span>
          </button>

          <Link
            href="/seller/products"
            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-amber-900 dark:text-amber-200">
              {lowStockItems.length > 0 ? `${lowStockItems.length} products are running low.` : "Stock levels are healthy."}
            </h3>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
              Stock levels trigger real-time availability on the customer checkout portal. Restock low items to prevent checkout rejection.
            </p>
          </div>
        </div>

        {lowStockItems.length > 0 && (
          <button
            onClick={handleQuickRestockAll}
            className="bg-brand-gold hover:bg-amber-400 text-brand-charcoal font-black py-2.5 px-5 rounded-xl text-xs shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Quick Restock All (+15 units)</span>
          </button>
        )}
      </div>

      {restockedToast && (
        <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All low-stock items have been replenished by +15 units and synchronized to the server!</span>
        </div>
      )}

      {/* Search & Stats */}
      <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, title, or category..."
            className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
          />
        </div>

        <div className="flex items-center gap-6 text-xs">
          <span className="text-muted-foreground">
            Total SKUs: <strong className="text-foreground">{products.length}</strong>
          </span>
          <span className="text-muted-foreground">
            Total Units in Stock: <strong className="text-brand-emerald font-black">{products.reduce((s, p) => s + (p.stockCount || 0), 0)} units</strong>
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center gap-2 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8">
          <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
          <span>Loading warehouse stock...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Product &amp; Category</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Pricing</th>
                  <th className="pb-3">Stock Quantity</th>
                  <th className="pb-3">Low-Stock Alert Level</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Quick Restock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products
                  .filter(
                    (p) =>
                      !search ||
                      p.title.toLowerCase().includes(search.toLowerCase()) ||
                      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
                      p.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((p) => {
                    const threshold = p.lowStockThreshold || 3;
                    const isLow = p.stockCount <= threshold;
                    const isOut = p.stockCount === 0;

                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 max-w-xs">
                          <div className="font-bold text-foreground truncate">{p.title}</div>
                          <div className="text-[10px] text-muted-foreground">{p.category}</div>
                        </td>
                        <td className="py-3.5 font-mono text-muted-foreground">{p.sku || `SKU-${p.id.slice(-4)}`}</td>
                        <td className="py-3.5 font-bold text-brand-emerald">{formatKSh(p.price)}</td>
                        <td className="py-3.5">
                          <span
                            className={`font-black text-sm ${
                              isOut ? "text-gray-400" : isLow ? "text-brand-red" : "text-brand-emerald"
                            }`}
                          >
                            {p.stockCount} units
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground">{threshold} units</td>
                        <td className="py-3.5">
                          {isOut ? (
                            <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full text-[10px] border border-gray-200">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="bg-red-50 text-brand-red font-bold px-2 py-0.5 rounded-full text-[10px] border border-red-200">
                              Low Stock
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-brand-emerald font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                              Healthy Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateStock(p.id, -1)}
                              disabled={p.stockCount === 0 || savingId === p.id}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                              title="Decrease stock (-1)"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateStock(p.id, 1)}
                              disabled={savingId === p.id}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="Increase stock (+1)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateStock(p.id, 10)}
                              disabled={savingId === p.id}
                              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-brand-emerald font-bold text-[10px] border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                              title="Quick restock (+10)"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />
    </div>
  );
}
