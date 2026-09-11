"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HERO_SLIDES } from "@/lib/data/kenya-data";
import { SearchAutocomplete } from "../navbar/search-autocomplete";
import { Sparkles, ArrowRight, Store, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
      className="relative min-h-[620px] lg:min-h-[700px] w-full flex items-center overflow-hidden bg-brand-dark-bg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Crossfade & Ken-Burns Zoom */}
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
                isActive ? "scale-105" : "scale-100"
              }`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
            {/* Multi-stage dark gradient overlay ensuring high contrast readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-bg via-transparent to-black/40" />
          </div>
        );
      })}

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-3xl space-y-6 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-emerald/30 border border-brand-emerald/50 backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-bold tracking-wide shadow-glow-green">
            <span>🇰🇪 KENYA&apos;S PREMIER DIGITAL COMMERCE PLATFORM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Discover. <span className="text-emerald-400">Shop.</span> <span className="text-amber-400">Prosper.</span>
            </h1>
            <p className="text-base sm:text-xl font-semibold text-emerald-100/95 max-w-2xl leading-snug">
              Authentic Kenyan merchants, genuine products, and verified local services across all 47 counties.
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-2xl">
            Direct Lipa na M-Pesa escrow protection, 24-hour countrywide door-to-door courier dispatch, and cryptographic receipts for every purchase.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-2xl space-y-3">
            <SearchAutocomplete
              placeholder="Search products, verified electronics, kitenge, or plumbers..."
              className="shadow-2xl"
              initialLocation="Nairobi"
            />
            {/* Quick Suggestions Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-200">
              <span className="font-bold text-amber-300">Trending Now:</span>
              <Link href="/marketplace?q=Samsung" className="hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors text-[11px] font-medium border border-white/10">
                Smartphones
              </Link>
              <Link href="/marketplace?q=Laptops" className="hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors text-[11px] font-medium border border-white/10">
                Laptops &amp; Tech
              </Link>
              <Link href="/marketplace?category=fashion-clothing" className="hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors text-[11px] font-medium border border-white/10">
                African Fashion
              </Link>
              <Link href="/services" className="hover:text-white bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors text-[11px] font-medium border border-white/10">
                Solar &amp; Electricians
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black px-7 py-3.5 rounded-xl text-xs sm:text-sm shadow-xl hover:shadow-glow-green transition-all transform hover:-translate-y-0.5 active:scale-98"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/seller/onboarding"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm transition-all active:scale-98"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Sell on VendLex</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-200 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Merchant Escrow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant M-Pesa STK Push</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All 47 Counties Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Controls */}
      <div className="absolute right-6 bottom-8 z-20 hidden sm:flex items-center gap-3">
        <button
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
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
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-8 bg-brand-emerald-light" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
