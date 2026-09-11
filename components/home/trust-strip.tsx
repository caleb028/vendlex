import React from "react";
import { ShieldCheck, Lock, MapPin, Truck, FileCheck2 } from "lucide-react";

export function TrustStrip() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Escrow Protection",
      desc: "Funds held safely until delivery confirmation",
      badge: "100% Safe",
    },
    {
      icon: Lock,
      title: "Lipa na M-Pesa STK",
      desc: "Instant encrypted checkout with zero hidden fees",
      badge: "Official",
    },
    {
      icon: FileCheck2,
      title: "Data Protection Act",
      desc: "2019 compliance & 256-bit TLS bank security",
      badge: "Verified",
    },
    {
      icon: Truck,
      title: "All 47 Counties",
      desc: "Same-day Nairobi & 24–48h countrywide courier",
      badge: "Nationwide",
    },
    {
      icon: MapPin,
      title: "Verified Merchants",
      desc: "Physical Kenyan stores with vetted credentials",
      badge: "Vetted",
    },
  ];

  return (
    <section className="bg-white dark:bg-brand-dark-card border-b border-border/80 dark:border-brand-dark-border py-5 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-muted/20 dark:bg-muted/10 hover:bg-brand-emerald-soft/50 dark:hover:bg-brand-emerald/10 border border-transparent hover:border-brand-emerald/30 transition-all duration-200 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-emerald-soft dark:bg-brand-emerald/20 text-brand-emerald dark:text-emerald-400 group-hover:bg-brand-emerald group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-xs group-hover:scale-105">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-brand-emerald transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
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
