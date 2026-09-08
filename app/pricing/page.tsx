"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRICING_PLANS } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { Check, Sparkles, Zap, HelpCircle, ShieldCheck } from "lucide-react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const faqs = [
    {
      q: "How do I receive payments from customers?",
      a: "Customers pay seamlessly on VendLex via instant M-Pesa STK push or card. Funds are credited directly to your registered M-Pesa Till, Paybill, or bank account according to your store settlement settings.",
    },
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes, you can upgrade from Starter to Business or Pro anytime from your Seller Dashboard. Upgrades take effect immediately with pro-rated billing.",
    },
    {
      q: "How does the Business Verification badge work?",
      a: "Verified merchants upload their Kenyan National ID and Business Registration Certificate / CR12. Once our compliance team approves your documents, the blue '✓ Verified Business' badge is activated automatically.",
    },
    {
      q: "What is the VendLex AI Assistant included in Business & Pro plans?",
      a: "It is your private 24/7 AI copywriter and marketing strategist that writes bilingual Swahili/English Facebook ads, SEO product descriptions, customer WhatsApp replies, and sales strategies tailored for Kenyan retail.",
    },
  ];

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-emerald-soft text-brand-emerald text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kenyan Merchant Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            Simple, Transparent Plans for Every Kenyan Hustle
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Zero hidden transaction fees on marketplace sales. Choose a tier designed to grow with your business.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-bold ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-8 bg-brand-emerald rounded-full p-1 transition-colors"
              aria-label="Toggle Monthly / Yearly Billing"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              <span>Annual Billing</span>
              <span className="bg-brand-gold text-brand-charcoal text-[10px] font-black px-2 py-0.5 rounded-full">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => {
            const price = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-b from-brand-emerald-dark to-brand-charcoal text-white shadow-2xl ring-2 ring-brand-emerald scale-[1.02] z-10"
                    : "bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border text-foreground hover:shadow-card-hover"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-gold-dark to-brand-gold text-brand-charcoal text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isPopular ? "text-emerald-300" : "text-muted-foreground"}`}>
                      {plan.badge}
                    </span>
                    <h3 className="text-xl font-extrabold mt-0.5">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">
                      {price === 0 ? "FREE" : formatKSh(Math.round(price))}
                    </span>
                    {price > 0 && (
                      <span className={`text-xs ${isPopular ? "text-gray-300" : "text-muted-foreground"}`}>
                        /month
                      </span>
                    )}
                  </div>

                  {isYearly && price > 0 && (
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      Billed annually ({formatKSh(plan.yearlyPrice)}/yr)
                    </div>
                  )}

                  <p className={`text-xs leading-relaxed ${isPopular ? "text-gray-200" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>

                  <div className="pt-4 border-t border-border/40 dark:border-brand-dark-border/60 space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? "text-amber-400" : "text-brand-emerald"}`} />
                        <span className={isPopular ? "text-gray-200" : "text-foreground"}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href={`/seller/onboarding?plan=${plan.id}`}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      isPopular
                        ? "bg-brand-emerald hover:bg-brand-emerald-light text-white shadow-glow-green"
                        : "bg-brand-off-white dark:bg-brand-dark-bg border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <Zap className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto space-y-6 pt-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground">Everything you need to know about selling on VendLex</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 space-y-2">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
