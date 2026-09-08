import React from "react";
import { HeroSlideshow } from "@/components/hero/hero-slideshow";
import { Hero3Pillars } from "@/components/home/hero-3-pillars";
import { CategoryGrid } from "@/components/home/category-grid";
import { DealsSection } from "@/components/home/deals-section";
import { ServicesSection } from "@/components/home/services-section";
import { CountyDiscoverySection } from "@/components/home/county-discovery-section";
import { DiscoverPreview } from "@/components/home/discover-preview";
import { WhyVendlex } from "@/components/home/why-vendlex";
import { FinalCTA } from "@/components/home/final-cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Large Clean Hero with Ken Burns Zoom-Out */}
      <HeroSlideshow />

      {/* 2. Compact 3 Pillars (SHOP • GROW • PROSPER) */}
      <ScrollReveal variant="fade-up" delay={50} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        <Hero3Pillars />
      </ScrollReveal>

      {/* 3. Clean Categories Grid */}
      <ScrollReveal variant="fade-up" delay={80}>
        <CategoryGrid />
      </ScrollReveal>

      {/* 4. Today's Deals (Scroll Zoom-Out into focus) */}
      <ScrollReveal variant="zoom-out" delay={100}>
        <DealsSection />
      </ScrollReveal>

      {/* 5. What Service Do You Need? */}
      <ScrollReveal variant="fade-up" delay={80}>
        <ServicesSection />
      </ScrollReveal>

      {/* 6. Explore Kenya */}
      <ScrollReveal variant="slide-left" delay={100}>
        <CountyDiscoverySection />
      </ScrollReveal>

      {/* 7. Discover What's Trending */}
      <ScrollReveal variant="slide-right" delay={100}>
        <DiscoverPreview />
      </ScrollReveal>

      {/* 8. Trust & Standards (Why VendLex) */}
      <ScrollReveal variant="fade-up" delay={80}>
        <WhyVendlex />
      </ScrollReveal>

      {/* 9. Clean Final Call-to-Action (Pop-up reveal) */}
      <ScrollReveal variant="pop-up" delay={120}>
        <FinalCTA />
      </ScrollReveal>
    </div>
  );
}
