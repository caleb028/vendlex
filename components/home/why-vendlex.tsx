import React from "react";
import { Compass, ShoppingBag, TrendingUp, Users, Zap } from "lucide-react";

export function WhyVendlex() {
  const pillars = [
    {
      icon: Compass,
      title: "Discover",
      subtitle: "Find Trusted Businesses",
      description: "Search 1,000+ verified Kenyan businesses, local artisans, and professional service providers across all 47 counties.",
      accent: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-500",
    },
    {
      icon: ShoppingBag,
      title: "Shop",
      subtitle: "Buy with 100% Peace of Mind",
      description: "Enjoy genuine electronics, authentic African fashion, and home goods with instant M-Pesa STK Push and fast courier delivery.",
      accent: "from-brand-emerald/20 to-brand-emerald/5",
      iconColor: "text-brand-emerald",
    },
    {
      icon: TrendingUp,
      title: "Grow",
      subtitle: "Enterprise Tools for All SMEs",
      description: "Unlock an all-in-one SaaS dashboard: automated PDF invoicing, live inventory alerts, sales analytics, and multi-channel orders.",
      accent: "from-brand-gold/20 to-brand-gold/5",
      iconColor: "text-brand-gold",
    },
    {
      icon: Users,
      title: "Connect",
      subtitle: "Build Direct Customer Loyalty",
      description: "Chat directly on WhatsApp, collect authentic verified photo reviews, and run targeted promotions to build repeat buyers.",
      accent: "from-brand-blue/20 to-brand-blue/5",
      iconColor: "text-brand-blue",
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-brand-dark-card border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-brand-emerald dark:text-brand-emerald-light uppercase tracking-wider">
            The VendLex Advantage
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Why Kenya Chooses VendLex
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We are more than just a marketplace — VendLex is the unified technology engine powering modern African commerce across all 47 counties.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="group relative bg-brand-off-white dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-card-hover hover:border-brand-emerald/50 transition-all duration-300 card-elevated flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.accent} flex items-center justify-center ${pillar.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {pillar.title}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mt-0.5 group-hover:text-brand-emerald transition-colors">
                      {pillar.subtitle}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 dark:border-brand-dark-border/60 flex items-center justify-between text-xs font-semibold text-brand-emerald">
                  <span>Pillar 0{index + 1}</span>
                  <Zap className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
