import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  CheckCircle2,
  Bell,
  Star,
} from "lucide-react";

export function ForBusinessOwners() {
  return (
    <section className="py-20 bg-brand-dark-bg text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-brand-emerald/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/30 border border-brand-emerald/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For Kenyan Entrepreneurs & Brands</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              Your Business Deserves to Be <span className="text-emerald-400">Online.</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Create your custom digital storefront, manage products and orders in real-time, generate instant KRA-ready invoices, and reach verified shoppers across all 47 counties from one powerful dashboard.
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Free custom digital storefront URL (vendlex.co.ke/store/your-name)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Direct M-Pesa STK Push checkout settled to your till/paybill</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Automated PDF invoice creator & low-stock SMS alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>VendLex AI Assistant for automatic Instagram & SEO copy</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/seller/onboarding"
                className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg hover:shadow-glow-green transition-all inline-flex items-center gap-2"
              >
                <span>Start Your Business Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-white text-xs sm:text-sm font-semibold underline underline-offset-4 px-2 py-2"
              >
                View Transparent Pricing Plans
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive SaaS Dashboard Mockup with Floating UI Cards */}
          <div className="lg:col-span-7 relative">
            {/* Main Mockup Container */}
            <div className="relative bg-brand-dark-card border border-brand-dark-border rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-brand-dark-border pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-gray-400 font-mono ml-2">
                    vendlex.co.ke/seller/nairobi-tech-hub
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                  ✓ Verified Store
                </span>
              </div>

              {/* Dashboard Metrics Header */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 bg-brand-dark-bg/80 border border-brand-dark-border rounded-2xl">
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Gross Sales (Aug)</div>
                  <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">KSh 428,500</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +28.4% this month
                  </div>
                </div>

                <div className="p-3 bg-brand-dark-bg/80 border border-brand-dark-border rounded-2xl">
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Total Orders</div>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">142 Orders</div>
                  <div className="text-[10px] text-gray-400 mt-1">47 Counties</div>
                </div>

                <div className="p-3 bg-brand-dark-bg/80 border border-brand-dark-border rounded-2xl">
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Customer Rating</div>
                  <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" /> 4.9
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">248 Reviews</div>
                </div>
              </div>

              {/* Simulated Recent Orders Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-300 mb-2">Live Order Stream</div>
                {[
                  { id: "SKL-89412", item: "Samsung S24 Ultra 512GB", county: "Nairobi", amount: "KSh 154,999", status: "Paid via M-Pesa", color: "text-emerald-400" },
                  { id: "SKL-89408", item: "Kitenge Custom Peplum Dress", county: "Mombasa", amount: "KSh 4,850", status: "Courier Assigned", color: "text-blue-400" },
                  { id: "SKL-89394", item: "Air Fryer 8.5L Dual Basket", county: "Nakuru", amount: "KSh 16,499", status: "Delivered", color: "text-gray-300" },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-brand-dark-bg/60 border border-brand-dark-border text-xs">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-emerald-light" />
                      <div>
                        <span className="font-semibold text-white">{row.item}</span>
                        <div className="text-[10px] text-gray-400">{row.id} • {row.county}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{row.amount}</div>
                      <div className={`text-[10px] font-semibold ${row.color}`}>{row.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating UI Card 1: Live Payment Alert */}
            <div className="absolute -top-6 -right-4 sm:-right-6 bg-white dark:bg-brand-dark-card border border-emerald-500/40 p-3 rounded-2xl shadow-xl backdrop-blur-lg animate-float">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  KES
                </div>
                <div>
                  <div className="text-[11px] font-bold text-foreground dark:text-white">💰 M-Pesa STK Received</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+KSh 154,999 from Grace W.</div>
                </div>
              </div>
            </div>

            {/* Floating UI Card 2: AI Marketing Generated */}
            <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white dark:bg-brand-dark-card border border-amber-500/40 p-3 rounded-2xl shadow-xl backdrop-blur-lg animate-float [animation-delay:2s]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-foreground dark:text-white">VendLex AI Assistant</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Instagram Campaign Ready ✨</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
