"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Percent, Plus, Tag, Copy, Check, Clock, Trash2 } from "lucide-react";

interface Promo {
  id: string;
  name: string;
  code: string;
  discountPct: number;
  startDate: string;
  endDate: string;
  usedCount: number;
  maxUsage: number;
  isActive: boolean;
}

const INITIAL_PROMOS: Promo[] = [
  {
    id: "p-1",
    name: "New Shopper Karibu Discount",
    code: "KARIBU10",
    discountPct: 10,
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    usedCount: 42,
    maxUsage: 100,
    isActive: true,
  },
  {
    id: "p-2",
    name: "End of Month Payday Super Sale",
    code: "GROW20",
    discountPct: 20,
    startDate: "2026-08-25",
    endDate: "2026-09-03",
    usedCount: 18,
    maxUsage: 50,
    isActive: true,
  },
];

export default function SellerPromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>(INITIAL_PROMOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pct, setPct] = useState("15");
  const [limit, setLimit] = useState("50");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newP: Promo = {
      id: `p-${Date.now()}`,
      name,
      code: code.toUpperCase(),
      discountPct: parseInt(pct) || 10,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      usedCount: 0,
      maxUsage: parseInt(limit) || 100,
      isActive: true,
    };
    setPromos([newP, ...promos]);
    setModalOpen(false);
    setName("");
    setCode("");
  };

  const handleCopy = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Promotions & Coupons</h1>
          <p className="text-xs text-muted-foreground">Create discount coupon codes, payday flash sales, and customer loyalty rewards.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Active Promotion
                </span>
                <h3 className="font-extrabold text-base text-foreground mt-0.5">{p.name}</h3>
              </div>
              <span className="text-base font-black text-brand-emerald bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200">
                {p.discountPct}% OFF
              </span>
            </div>

            {/* Code Box */}
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-2xl border border-dashed border-border">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-emerald" />
                <span className="font-mono font-bold text-sm text-foreground tracking-wider">{p.code}</span>
              </div>
              <button
                onClick={() => handleCopy(p.code)}
                className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
              >
                {copiedCode === p.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === p.code ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            {/* Usage progress */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Usage: <strong>{p.usedCount}</strong> of {p.maxUsage} customers</span>
                <span>Valid until {p.endDate}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-emerald rounded-full"
                  style={{ width: `${(p.usedCount / p.maxUsage) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Promotion Coupon">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mashujaa Day Tech Discount"
              className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MASHUJAA15"
                className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground font-mono uppercase focus:outline-none focus:border-brand-emerald"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Discount (%) *</label>
              <input
                type="number"
                required
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground font-bold focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Max Total Usage Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-muted/40 border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-emerald text-white font-bold py-3 rounded-xl text-xs"
          >
            Activate Coupon Code
          </button>
        </form>
      </Modal>
    </div>
  );
}
