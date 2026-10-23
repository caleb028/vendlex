"use client";

import React from "react";
import { HeroSlideshow } from "@/components/hero/hero-slideshow";
import { CategoryGrid } from "@/components/home/category-grid";
import { DealsSection } from "@/components/home/deals-section";
import { ServicesSection } from "@/components/home/services-section";
import { SponsoredBusinessesSection } from "@/components/home/sponsored-businesses-section";
import { CountyDiscoverySection } from "@/components/home/county-discovery-section";
import { WhyVendlex } from "@/components/home/why-vendlex";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FinalCTA } from "@/components/home/final-cta";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Clean High-Impact Hero */}
      <HeroSlideshow />

      {/* 2. Department & Popular Categories Grid */}
      <CategoryGrid />

      {/* 4. Today's Deals & Hot Discounts */}
      <DealsSection />

      {/* 5. Certified Local Services & Trades */}
      <ServicesSection />

      {/* 6. Sponsored Local Businesses */}
      <SponsoredBusinessesSection />

      {/* 7. Explore Kenya Across All 47 Counties */}
      <CountyDiscoverySection />

      {/* 8. Why VendLex - Trust, Protection & Tools */}
      <WhyVendlex />

      {/* 9. Verified Customer & Merchant Stories */}
      <TestimonialsSection />

      {/* 10. Final Call-to-Action */}
      <FinalCTA />
    </div>
  );
}
