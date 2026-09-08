"use client";

import React from "react";
import { Product } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/badge";
import { X, Check, Star, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ProductComparisonDrawer({
  products,
  isOpen,
  onClose,
}: {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-brand-dark-card rounded-t-3xl border-t border-border shadow-2xl p-6 overflow-y-auto space-y-6 animate-slideUp">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-foreground">
              Product Comparison Tool ({products.length} Items Selected)
            </h3>
            <p className="text-xs text-muted-foreground">Compare technical specs, county location, merchant verification, and pricing side-by-side.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 w-1/4 text-muted-foreground font-bold uppercase">Attribute</th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 w-1/3 text-foreground font-bold">
                    <div className="flex items-center gap-2">
                      <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-xl object-cover border bg-muted" />
                      <span className="line-clamp-2">{p.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="p-3 font-bold text-muted-foreground">Price</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 font-black text-sm text-brand-emerald">
                    {formatKSh(p.price)}
                    {p.originalPrice && <span className="text-xs text-muted-foreground line-through block font-normal">{formatKSh(p.originalPrice)}</span>}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-muted-foreground">Store &amp; Location</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-foreground">
                    <div className="flex items-center gap-1 font-semibold">
                      <span>{p.businessName}</span>
                      {p.businessVerified && <VerifiedBadge />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{p.county} County</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-muted-foreground">Rating &amp; Reviews</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className="text-amber-500 font-bold">★ {p.rating}</span> ({p.reviewCount} reviews)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-muted-foreground">Stock Status</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      p.inStock ? "bg-emerald-100 text-brand-emerald" : "bg-red-100 text-brand-red"
                    }`}>
                      {p.inStock ? `In Stock (${p.stockCount} units)` : "Out of Stock"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-muted-foreground">Action</td>
                {products.map((p) => (
                  <td key={p.id} className="p-3">
                    <Link
                      href={`/products/${p.slug}`}
                      className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1 shadow-sm"
                    >
                      <span>View Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
