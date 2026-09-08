"use client";

import React from "react";
import { Download, FileText, Sparkles, CheckCircle2, Star, ShieldCheck } from "lucide-react";
import { formatKSh } from "@/lib/utils";

const DIGITAL_ITEMS = [
  { id: "dig-1", title: "Kenyan Tax & eTIMS Compliance E-Book (2026 Edition)", category: "Business & Finance", price: 1500, size: "4.2 MB", sales: 340, rating: 4.9 },
  { id: "dig-2", title: "Figma UI Kit: African Mobile Banking & M-Pesa Apps", category: "Design & Code", price: 3500, size: "48 MB", sales: 180, rating: 5.0 },
  { id: "dig-3", title: "Nairobi Commercial Real Estate Investment Model (.xlsx)", category: "Real Estate", price: 2800, size: "1.8 MB", sales: 210, rating: 4.8 },
  { id: "dig-4", title: "Swahili Audio Masterclass: E-Commerce Growth Strategies", category: "Audiobook", price: 1200, size: "120 MB", sales: 490, rating: 4.9 },
];

export default function DigitalProductsPage() {
  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-brand-emerald rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-amber-400 text-brand-charcoal text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ⚡ Instant Download
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">Digital Products Marketplace</h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Buy &amp; sell ebooks, financial models, design templates, and software with instant M-Pesa delivery.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DIGITAL_ITEMS.map((item) => (
            <div key={item.id} className="bg-white dark:bg-brand-dark-card border border-border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">{item.category}</span>
                <h3 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>File: {item.size}</span>
                  <span className="text-amber-500 font-bold">★ {item.rating}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-base font-black text-brand-emerald">{formatKSh(item.price)}</span>
                <button
                  onClick={() => alert(`Initiated instant M-Pesa download for ${item.title}`)}
                  className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
