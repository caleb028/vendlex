import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Store, CheckCircle2 } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-12 sm:py-16 bg-brand-dark-bg relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald-dark/80 via-brand-dark-bg to-brand-charcoal opacity-95" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-emerald/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span>JOIN 10,000+ KENYAN COMMERCE LEADERS</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Grow Your Business?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join the digital marketplace built specifically for Kenyan enterprises. Open your online storefront, automate your orders, accept M-Pesa payments, and reach customers countrywide.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/marketplace"
            className="bg-white hover:bg-emerald-50 text-brand-charcoal font-bold px-8 py-4 rounded-xl text-sm shadow-xl transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <span>Explore VendLex</span>
            <ArrowRight className="w-4 h-4 text-brand-emerald" />
          </Link>

          <Link
            href="/seller/onboarding"
            className="bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light text-brand-charcoal font-black px-8 py-4 rounded-xl text-sm shadow-xl hover:shadow-glow-gold transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Store className="w-4 h-4" />
            <span>List Your Business Free</span>
          </Link>
        </div>

        {/* 3 mini guarantees */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Setup Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Free Storefront URL</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant M-Pesa Integration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
