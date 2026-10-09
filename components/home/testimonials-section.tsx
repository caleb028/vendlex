"use client";

import React from "react";
import { motion } from "framer-motion";
import { MOCK_TESTIMONIALS } from "@/lib/data/kenya-data";
import { Star, TrendingUp, User } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-14 sm:py-20 bg-white dark:bg-brand-dark-card border-t border-border/60 dark:border-brand-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-2"
        >
          <span className="text-xs font-black text-brand-emerald dark:text-emerald-400 uppercase tracking-wider">
            Verified Experiences &bull; Kenya
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Trusted by Entrepreneurs &amp; Shoppers Nationwide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Discover how retail shops, artisans, and everyday shoppers in Nairobi, Mombasa, Nakuru, and Eldoret thrive on VendLex.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {MOCK_TESTIMONIALS.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-brand-off-white dark:bg-brand-dark-bg/60 border border-border/80 dark:border-brand-dark-border rounded-2xl p-6 sm:p-7 shadow-card hover:shadow-card-hover hover:border-brand-emerald/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 h-full"
            >
              <div className="space-y-4">
                {/* Rating & Growth Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-brand-emerald dark:text-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                    <TrendingUp className="w-3 h-3" />
                    <span>{t.growthMetric}</span>
                  </span>
                </div>

                {/* Quote text */}
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60 dark:border-brand-dark-border/60">
                <div className="w-11 h-11 rounded-full bg-muted/60 dark:bg-brand-dark-card border border-border/80 dark:border-brand-dark-border flex items-center justify-center text-muted-foreground shrink-0 shadow-xs">
                  <User className="w-5 h-5 text-muted-foreground/80 dark:text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1">
                    <span>{t.name}</span>
                    <span className="text-brand-emerald text-[10px]" title="Verified Merchant">✓</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium">{t.role} &bull; {t.businessName}</p>
                  <p className="text-[10px] text-brand-emerald dark:text-emerald-400 font-bold uppercase tracking-wider">{t.county} County</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
