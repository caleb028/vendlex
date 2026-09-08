import React from "react";
import { HeroSlideshow } from "@/components/hero/hero-slideshow";
import { CategoryGrid } from "@/components/home/category-grid";
import { DealsSection } from "@/components/home/deals-section";
import { ServicesSection } from "@/components/home/services-section";
import { SponsoredBusinessesSection } from "@/components/home/sponsored-businesses-section";
import { CountyDiscoverySection } from "@/components/home/county-discovery-section";
import { WhyVendlex } from "@/components/home/why-vendlex";
import { FinalCTA } from "@/components/home/final-cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Streamlined High-Impact Hero */}
      <HeroSlideshow />

      {/* 2. Department & Popular Categories Grid */}
      <ScrollReveal variant="fade-up" delay={50}>
        <CategoryGrid />
      </ScrollReveal>

      {/* 3. Today's Deals & Hot Discounts */}
      <ScrollReveal variant="fade-up" delay={60}>
        <DealsSection />
      </ScrollReveal>

      {/* 4. Certified Local Services & Trades */}
      <ScrollReveal variant="fade-up" delay={60}>
        <ServicesSection />
      </ScrollReveal>

      {/* 5. Sponsored Local Businesses */}
      <ScrollReveal variant="fade-up" delay={60}>
        <SponsoredBusinessesSection />
      </ScrollReveal>

      {/* 6. Explore Kenya Across All 47 Counties */}
      <ScrollReveal variant="fade-up" delay={60}>
        <CountyDiscoverySection />
      </ScrollReveal>

      {/* 7. Why VendLex - Trust, Protection & Tools */}
      <ScrollReveal variant="fade-up" delay={60}>
        <WhyVendlex />
      </ScrollReveal>

      {/* 8. Final Call-to-Action */}
      <ScrollReveal variant="pop-up" delay={80}>
        <FinalCTA />
      </ScrollReveal>
    </div>
  );
}
