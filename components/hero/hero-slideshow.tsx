"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SearchAutocomplete } from "../navbar/search-autocomplete";
import { ArrowRight, Store, ShieldCheck, CreditCard, Truck } from "lucide-react";

const CURATED_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1400&auto=format&fit=crop",
    title: "Discover Verified Kenyan Businesses & Goods",
    subtitle: "Shop genuine electronics, fashion, and county trades with instant M-Pesa escrow protection.",
  },
  {
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1400&auto=format&fit=crop",
    title: "Kenya's Premier Digital Commerce Ecosystem",
    subtitle: "Connecting verified merchants and local service professionals across all 47 counties.",
  },
  {
    image: "https://images.unsplash.com/photo-1556742049-0a67e55722c0?q=80&w=1400&auto=format&fit=crop",
    title: "Grow Your Business with Modern Digital Tools",
    subtitle: "List products, accept automated M-Pesa payments, and reach customers nationwide.",
  },
];

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CURATED_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = CURATED_SLIDES[currentSlide];

  return (
    <section className="relative min-h-[460px] md:min-h-[500px] w-full flex items-center overflow-hidden bg-brand-dark-bg">
      {/* Background with subtle crossfade */}
      {CURATED_SLIDES.map((s, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${s.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-bg via-transparent to-black/40" />
          </div>
        );
      })}

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="max-w-2xl space-y-5">
          {/* High-trust badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 backdrop-blur-md text-emerald-300 text-xs font-bold tracking-wide shadow-sm">
            <span>🇰🇪 Kenya&apos;s Verified Commerce Network</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
              {slide.subtitle}
            </p>
          </div>

          {/* Search Box */}
          <div className="pt-1">
            <SearchAutocomplete
              placeholder="Search products, businesses or services..."
              className="shadow-xl"
              initialLocation="Nairobi"
            />
            {/* Quick Popular Keywords */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-gray-300">
              <span className="font-semibold text-emerald-400">Popular:</span>
              <Link href="/marketplace?q=Phones" className="hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors">
                Smartphones
              </Link>
              <Link href="/marketplace?q=Laptops" className="hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors">
                Laptops
              </Link>
              <Link href="/marketplace?category=fashion-clothing" className="hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors">
                Fashion
              </Link>
              <Link href="/services" className="hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors">
                Services &amp; Repairs
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/seller/onboarding"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all"
            >
              <Store className="w-4 h-4 text-amber-300" />
              <span>Sell on VendLex</span>
            </Link>
          </div>

          {/* Clean Trust Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified Merchants</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant Lipa na M-Pesa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>47 Counties Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {CURATED_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-6 bg-brand-emerald" : "w-2 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
