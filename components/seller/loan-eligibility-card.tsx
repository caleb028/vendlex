"use client";

import React from "react";
import { DollarSign, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatKSh } from "@/lib/utils";

export function SellerLoanEligibilityCard({
  storeName = "Nairobi Tech Hub",
  monthlySales = 840000,
  rating = 4.95,
  deliverySuccessRate = 98.4,
}: {
  storeName?: string;
  monthlySales?: number;
  rating?: number;
  deliverySuccessRate?: number;
}) {
  const calculatedCreditLimit = Math.round(monthlySales * 0.45); // 45% of monthly revenue pre-approval

  return (
    <div className="bg-gradient-to-br from-brand-charcoal via-gray-900 to-brand-emerald-dark text-white rounded-3xl p-6 shadow-xl space-y-5 border border-brand-emerald/30">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-gold text-brand-charcoal font-black flex items-center justify-center shadow-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-1.5">
              <span>VendLex Merchant Capital &amp; Credit Line</span>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                PRE-APPROVED
              </span>
            </h3>
            <p className="text-xs text-gray-300">Instant inventory financing based on your Lipa na M-Pesa sales history.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Pre-Approved Working Capital Limit</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400">
            {formatKSh(calculatedCreditLimit)}
          </div>
          <span className="text-[11px] text-gray-300 mt-1 block">
            0% Interest for 14 days • Repay automatically from future store sales.
          </span>
        </div>

        <button className="bg-brand-gold hover:bg-amber-400 text-brand-charcoal font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg hover:scale-105 transition-all shrink-0 flex items-center gap-2">
          <Zap className="w-4 h-4 fill-current" />
          <span>Draw Capital via M-Pesa</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-gray-800">
        <div className="p-2.5 bg-white/10 rounded-xl">
          <span className="text-[10px] text-gray-400 block">Monthly Sales</span>
          <span className="font-bold text-white">{formatKSh(monthlySales)}</span>
        </div>
        <div className="p-2.5 bg-white/10 rounded-xl">
          <span className="text-[10px] text-gray-400 block">Delivery Reliability</span>
          <span className="font-bold text-emerald-400">{deliverySuccessRate}%</span>
        </div>
        <div className="p-2.5 bg-white/10 rounded-xl">
          <span className="text-[10px] text-gray-400 block">Merchant Rating</span>
          <span className="font-bold text-amber-300">★ {rating}</span>
        </div>
      </div>
    </div>
  );
}
