import React from "react";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://vendlex.vercel.app/#organization",
    name: "VendLex Technologies Kenya",
    legalName: "VendLex Technologies Limited",
    alternateName: ["VendLex", "VendLex Kenya", "VendLex Marketplace"],
    url: "https://vendlex.vercel.app",
    logo: {
      "@type": "ImageObject",
      url: "https://vendlex.vercel.app/logo/vendlex-logo.png",
      width: 512,
      height: 512,
      caption: "VendLex Kenya Logo",
    },
    image: "https://vendlex.vercel.app/logo/vendlex-logo.png",
    description:
      "Kenya's premier digital commerce marketplace and SaaS business ecosystem powering verified merchants, escrow payments, and Lipa na M-Pesa transactions across all 47 counties.",
    email: "support@vendlex.vercel.app",
    telephone: "+254700000000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kilimani, Argwings Kodhek Rd",
      addressLocality: "Nairobi",
      addressRegion: "Nairobi County",
      postalCode: "00100",
      addressCountry: "KE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -1.286389,
      longitude: 36.817223,
    },
    founder: {
      "@type": "Person",
      name: "Caleb Ngiciri",
      jobTitle: "Founder & Chief Executive Officer",
    },
    sameAs: [
      "https://twitter.com/vendlex_ke",
      "https://facebook.com/vendlexke",
      "https://instagram.com/vendlex_ke",
      "https://linkedin.com/company/vendlex",
      "https://github.com/caleb028/vendlex",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+254700000000",
        contactType: "customer service",
        areaServed: "KE",
        availableLanguage: ["English", "Swahili"],
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://vendlex.vercel.app/#website",
    url: "https://vendlex.vercel.app",
    name: "VendLex Kenya",
    alternateName: "VendLex Marketplace",
    description: "Buy and Sell Online Across All 47 Counties in Kenya with Secure Escrow and Lipa na M-Pesa",
    publisher: {
      "@id": "https://vendlex.vercel.app/#organization",
    },
    inLanguage: "en-KE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://vendlex.vercel.app/marketplace?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://vendlex.vercel.app/#app",
    name: "VendLex Mobile App for Android",
    operatingSystem: "Android",
    applicationCategory: "ShoppingApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KES",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "3820",
      bestRating: "5",
      worstRating: "1",
    },
    downloadUrl: "https://vendlex.vercel.app/api/download/apk",
    fileSize: "18MB",
    author: {
      "@id": "https://vendlex.vercel.app/#organization",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
    </>
  );
}
