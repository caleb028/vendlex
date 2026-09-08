"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HERO_SLIDES } from "@/lib/data/kenya-data";
import { Search, ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag } from "lucide-react";
import { Cinematic3DHeadline } from "./cinematic-3d-headline";

export function HeroSlideshow() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const SLIDE_DURATION = 7000;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <section
      className="relative min-h-[560px] lg:min-h-[620px] w-full flex items-center overflow-hidden bg-brand-dark-bg"
      aria-label="VendLex Hero Commerce"
    >
      {/* Background Commerce Slides with Soft Slow Crossfade */}
      {HERO_SLIDES.map((s, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
            }`}
          >
            <div
              className={`w-full h-full bg-cover bg-center transition-transform ${
                isActive ? "animate-ken-burns-zoom-out" : "scale-100"
              }`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
            {/* Soft, readable dark overlay */}
            <div className="absolute inset-0 bg-black/75 via-black/60 to-black/85" />
          </div>
        );
      })}

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full text-center space-y-6 sm:space-y-8">
        {/* Exact Headline with Cinematic 3D Letter-by-Letter Light Reflection */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <Cinematic3DHeadline />
          <p className="text-sm sm:text-lg text-gray-200 font-normal max-w-2xl mx-auto leading-relaxed">
            Shop trusted products, discover local businesses and connect with verified professionals across Kenya.
          </p>
        </div>

        {/* Large Clean Search Bar (Section 2) */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white dark:bg-brand-dark-card rounded-2xl shadow-xl p-1.5 sm:p-2 border border-white/20 focus-within:ring-2 focus-within:ring-brand-emerald transition-all"
          >
            <div className="flex items-center flex-1 px-3">
              <Search className="w-5 h-5 text-muted-foreground mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search products, businesses or services..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-medium focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Primary & Secondary CTAs (Section 2) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            href="/marketplace"
            className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md transition-all hover:scale-102 active:scale-98"
          >
            Explore Marketplace
          </Link>
          <Link
            href="/seller/onboarding"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-semibold text-xs sm:text-sm py-3 px-6 rounded-xl transition-all"
          >
            Start Selling
          </Link>
        </div>

        {/* Small Clean Trust Row (Section 2) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-gray-300 font-medium pt-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Verified sellers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Nationwide marketplace</span>
          </div>
        </div>
      </div>
    </section>
  );
}
