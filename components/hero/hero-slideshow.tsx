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
          {/* HIGH-VISIBILITY 47 COUNTIES BADGE & CATEGORY PILL */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 backdrop-blur-md text-emerald-200 text-xs sm:text-sm font-extrabold tracking-wide shadow-glow-green">
              <span>🇰🇪 CONNECTING ALL 47 COUNTIES IN KENYA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            {slide?.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{slide.badge}</span>
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Discover. <span className="text-emerald-400">Shop.</span> <span className="text-amber-400">Grow.</span>
            </h1>
            <p className="text-lg sm:text-xl font-medium text-emerald-100/90 max-w-2xl">
              Kenya&apos;s modern marketplace and business growth platform.
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Discover trusted Kenyan businesses, shop authentic products and verified local services, and give your business the digital tools it needs to thrive.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-2xl">
            <SearchAutocomplete
              placeholder="Search products, verified businesses or services..."
              className="shadow-2xl"
              initialLocation="Nairobi"
            />
            {/* Quick Suggestions Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-300">
              <span className="font-semibold text-emerald-400">Popular:</span>
              <Link href="/marketplace?q=Samsung" className="hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm transition-colors">
                Samsung S24
              </Link>
              <Link href="/marketplace?q=Laptops" className="hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm transition-colors">
                MacBook &amp; HP Laptops
              </Link>
              <Link href="/marketplace?category=fashion-clothing" className="hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm transition-colors">
                Kitenge Dresses
              </Link>
              <Link href="/services" className="hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm transition-colors">
                Plumbing &amp; Solar
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg hover:shadow-glow-green transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Businesses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/seller/onboarding"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>List Your Business</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified KEBS &amp; County Sellers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant M-Pesa STK Checkout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>24-Hour Countrywide Dispatch</span>
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
