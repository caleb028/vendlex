import React from "react";
import { ShieldCheck, Truck, Store, MessageCircle } from "lucide-react";

export function TrustStrip() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Lipa na M-Pesa Escrow",
      desc: "Zero buyer risk. Funds remain in vault until you inspect and approve your delivery.",
      badge: "100% Protected",
    },
    {
      icon: Truck,
      title: "All 47 Counties Connected",
      desc: "Same-day Nairobi delivery & 24h tracked countrywide parcel dispatch.",
      badge: "Nationwide",
    },
    {
      icon: Store,
      title: "100% Verified Merchants",
      desc: "Physical Kenyan shops, workshops, and SMEs with verified premises.",
      badge: "KYC Vetted",
    },
    {
      icon: MessageCircle,
      title: "Direct WhatsApp & Call",
      desc: "Chat directly with local sellers to negotiate, confirm stock, or request custom orders.",
      badge: "Direct Touch",
    },
  ];

  return (
    <section className="bg-white dark:bg-brand-dark-card border-b border-border/80 dark:border-brand-dark-border py-6 sm:py-8 shadow-xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex items-start gap-3.5 p-4 rounded-2xl bg-muted/20 dark:bg-muted/10 hover:bg-brand-emerald-soft/40 dark:hover:bg-brand-emerald/10 border border-border/60 hover:border-brand-emerald/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-2xl bg-brand-emerald-soft dark:bg-brand-emerald/20 text-brand-emerald dark:text-emerald-400 group-hover:bg-brand-emerald group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-xs group-hover:scale-105 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-brand-emerald transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
