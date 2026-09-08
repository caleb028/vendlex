import React from "react";
import { ShieldCheck, Lock, MapPin, Truck, TrendingUp } from "lucide-react";

export function TrustStrip() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Verified Businesses",
      desc: "Vetted Kenyan sellers with physical stores",
    },
    {
      icon: Lock,
      title: "Secure M-Pesa Shopping",
      desc: "Escrow-ready protected payments",
    },
    {
      icon: MapPin,
      title: "Built for Kenya",
      desc: "Coverage across all 47 counties",
    },
    {
      icon: Truck,
      title: "Local Commerce & Courier",
      desc: "Same-day Nairobi & 24h countrywide",
    },
    {
      icon: TrendingUp,
      title: "Business Growth Tools",
      desc: "Inventory, Invoicing & AI marketing",
    },
  ];

  return (
    <section className="bg-white dark:bg-brand-dark-card border-b border-border dark:border-brand-dark-border py-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-brand-emerald-soft/50 dark:hover:bg-brand-dark-border/50 transition-all duration-300 card-elevated cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-emerald-soft dark:bg-brand-dark-border text-brand-emerald dark:text-brand-emerald-light group-hover:bg-brand-emerald group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-brand-emerald transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
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
