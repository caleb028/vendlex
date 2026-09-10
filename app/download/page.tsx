import React from "react";
import type { Metadata } from "next";
import { DownloadView } from "@/components/download/download-view";

export const metadata: Metadata = {
  title: "Download VendLex App (Android APK & Direct Install) | Fast & Free",
  description:
    "Get the official VendLex Android Mobile App directly on your phone. Enjoy instant Lipa na M-Pesa checkout, push alerts for dispatch & delivery, and offline receipt storage.",
  keywords: [
    "VendLex APK download",
    "VendLex Android App",
    "Kenya marketplace app",
    "Lipa na M-Pesa shopping app",
    "Install VendLex App",
  ],
  openGraph: {
    title: "Download VendLex App (Official Android App) | Kenya",
    description: "Get Kenya's premier digital commerce and business ecosystem directly on your mobile device. Fast, lightweight, Lipa na M-Pesa integrated.",
    images: [{ url: "/logo/vendlex-logo.png", width: 1200, height: 630, alt: "Download VendLex APK" }],
  },
};

export default function DownloadPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VendLex Kenya",
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
    },
    downloadUrl: "https://vendlex.vercel.app/api/download/apk",
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DownloadView />
    </div>
  );
}
