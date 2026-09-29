"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HERO_SLIDES } from "@/lib/data/kenya-data";
import { ArrowRight, ChevronLeft, ChevronRight, Store } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isReduced = Boolean(shouldReduceMotion);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative min-h-[640px] sm:min-h-[680px] lg:min-h-[740px] w-full flex items-center overflow-hidden bg-brand-dark-bg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Crossfade & Subtle Zoom */}
      {HERO_SLIDES.map((s, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          >
            <div
              className={`w-full h-full bg-cover bg-center transition-transform duration-[8000ms] ease-out ${
                isActive && !isReduced ? "scale-105" : "scale-100"
              }`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
            {/* Multi-stage dark gradient overlay ensuring high contrast readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-bg via-transparent to-black/50" />
          </div>
        );
      })}

      {/* Dynamic Hero Banner Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24 w-full flex items-center min-h-[540px] sm:min-h-[600px] lg:min-h-[660px]">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="lg:col-span-7 space-y-5 sm:space-y-6"
            >
              {slide.badge && (
                <motion.div
                  initial={isReduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: isReduced ? 0 : 0.4, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-emerald/30 border border-brand-emerald/50 backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-black tracking-wide">
                    <span>{slide.badge}</span>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3.5">
                {/* Headline: Responsive typography with proper breathing room and zero awkward breaks */}
                <motion.h1
                  initial={isReduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: isReduced ? 0 : 0.5, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]"
                >
                  {slide.title}
                </motion.h1>

                {/* Subheadline: Comfortable text size and line height */}
                <motion.p
                  initial={isReduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: isReduced ? 0 : 0.5,
                    delay: isReduced ? 0 : 0.12,
                    ease: "easeOut",
                  }}
                  className="text-sm sm:text-base md:text-lg font-normal text-emerald-100/90 leading-relaxed max-w-xl"
                >
                  {slide.subtitle}
                </motion.p>
              </div>

              {/* CTA Buttons: Spacious Shop Now + Sell on VendLex */}
              <motion.div
                initial={isReduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: isReduced ? 0 : 0.5,
                  delay: isReduced ? 0 : 0.24,
                  ease: "easeOut",
                }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-extrabold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm shadow-xl hover:shadow-glow-green transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/seller"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md font-bold px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Store className="w-4 h-4 text-amber-300" />
                  <span>Open Your Store</span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop Right Highlights Glass Card: Balances the Hero seamlessly */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    Live Kenya Commerce
                  </span>
                </div>
                <span className="text-[10px] text-gray-300 font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  47 Counties
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-gray-400 block">Buyer Protection</span>
                    <span className="text-xs font-black text-white block">Lipa na M-Pesa Escrow</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30">
                    100% Protected
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-gray-400 block">Courier Transit</span>
                    <span className="text-xs font-black text-white block">Same-Day &amp; 24h Nationwide</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30">
                    Tracked Dispatch
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-gray-400 block">Verified Merchants</span>
                    <span className="text-xs font-black text-white block">1,200+ Licensed Kenyan Stores</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-emerald-light bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30">
                    KYC Vetted
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/download"
                  className="text-xs font-bold text-amber-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Get the VendLex Mobile App (Android APK)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Controls */}
      <div className="absolute right-6 bottom-8 z-20 hidden sm:flex items-center gap-3">
        <button
          onClick={prevSlide}
          className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-9 bg-brand-emerald-light" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
