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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 w-full flex items-center min-h-[480px] sm:min-h-[540px] lg:min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="max-w-4xl space-y-6 sm:space-y-8"
          >
            {slide.badge && (
              <motion.div
                initial={isReduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: isReduced ? 0 : 0.5, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-emerald/30 border border-brand-emerald/50 backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-bold tracking-wide">
                  <span>{slide.badge}</span>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Headline: text-5xl on mobile up to text-7xl on desktop, tight leading, font-extrabold */}
              <motion.h1
                initial={isReduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: isReduced ? 0 : 0.6, ease: "easeOut" }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
              >
                {slide.title}
              </motion.h1>

              {/* Subheadline: text-lg on mobile up to text-2xl on desktop, max-w-2xl, lighter weight */}
              <motion.p
                initial={isReduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: isReduced ? 0 : 0.6,
                  delay: isReduced ? 0 : 0.15,
                  ease: "easeOut",
                }}
                className="text-lg sm:text-xl lg:text-2xl font-normal text-emerald-100/90 leading-relaxed max-w-2xl"
              >
                {slide.subtitle}
              </motion.p>
            </div>

            {/* CTA Buttons: Shop Now + Sell on VendLex */}
            <motion.div
              initial={isReduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: isReduced ? 0 : 0.6,
                delay: isReduced ? 0 : 0.3,
                ease: "easeOut",
              }}
              className="flex flex-wrap items-center gap-3.5 pt-2 sm:pt-4"
            >
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2.5 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-extrabold px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base shadow-xl hover:shadow-glow-green transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/seller"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md font-bold px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <Store className="w-5 h-5 text-amber-300" />
                <span>Sell on VendLex</span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
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
      <div className="absolute bottom-16 sm:bottom-8 left-1/2 sm:left-auto sm:right-32 -translate-x-1/2 sm:translate-x-0 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-8 bg-brand-emerald-light" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll to Explore Animated Indicator (matching top-grade-rice-millers) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="hidden sm:flex absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 z-20 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/70 font-sans font-semibold">
          Scroll to Explore
        </span>
        <div className="w-[1.5px] h-7 bg-white/20 relative overflow-hidden rounded-full">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-brand-emerald"
          />
        </div>
      </motion.div>
    </section>
  );
}
