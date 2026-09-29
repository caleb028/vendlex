import React from "react";
import { HeroSlideshow } from "@/components/hero/hero-slideshow";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategoryGrid } from "@/components/home/category-grid";
import { DealsSection } from "@/components/home/deals-section";
import { TrendingProducts } from "@/components/home/trending-products";
import { CountyDiscoverySection } from "@/components/home/county-discovery-section";
import { ServicesSection } from "@/components/home/services-section";
import { SponsoredBusinessesSection } from "@/components/home/sponsored-businesses-section";
import { WhyVendlex } from "@/components/home/why-vendlex";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FinalCTA } from "@/components/home/final-cta";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Clean High-Impact Hero with Live Highlights */}
      <HeroSlideshow />

      {/* 2. Marketplace Security & Value Assurance Strip */}
      <TrustStrip />

      {/* 3. Department & Popular Categories Grid */}
      <ScrollReveal variant="fade-up" delay={40}>
        <CategoryGrid />
      </ScrollReveal>

      {/* 4. Today's Flash Deals & Discounts */}
      <ScrollReveal variant="fade-up" delay={50}>
        <DealsSection />
      </ScrollReveal>

      {/* 5. Trending Kenyan Marketplace Products */}
      <ScrollReveal variant="fade-up" delay={50}>
        <TrendingProducts />
      </ScrollReveal>

      {/* 6. Explore Kenya Across All 47 Counties */}
      <ScrollReveal variant="fade-up" delay={50}>
        <CountyDiscoverySection />
      </ScrollReveal>

      {/* 7. Certified Local Services & Trades */}
      <ScrollReveal variant="fade-up" delay={50}>
        <ServicesSection />
      </ScrollReveal>

      {/* 8. Sponsored Local Businesses & Spotlights */}
      <ScrollReveal variant="fade-up" delay={50}>
        <SponsoredBusinessesSection />
      </ScrollReveal>

      {/* 9. Why VendLex - The Commerce Standard */}
      <ScrollReveal variant="fade-up" delay={50}>
        <WhyVendlex />
      </ScrollReveal>

      {/* 10. Verified Customer & Merchant Stories */}
      <ScrollReveal variant="fade-up" delay={50}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* 11. Final High-Conversion Call-to-Action */}
      <ScrollReveal variant="pop-up" delay={60}>
        <FinalCTA />
      </ScrollReveal>
    </div>
  );
}
