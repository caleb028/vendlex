import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { CartProvider } from "@/lib/store/cart-store";
import { AuthProvider } from "@/lib/store/auth-store";
import { WishlistProvider } from "@/lib/store/wishlist-store";
import { NotificationProvider } from "@/lib/store/notification-store";

export const metadata: Metadata = {
  metadataBase: new URL("https://vendlex.co.ke"),
  title: "VendLex | Kenyan Marketplace | Buy. Sell. Grow.",
  description:
    "VendLex connects customers, businesses, sellers, and services across all 47 counties in Kenya in one digital ecosystem with direct Lipa na M-Pesa payments.",
  keywords: [
    "VendLex",
    "Kenya marketplace",
    "Nairobi business directory",
    "Lipa na M-Pesa",
    "Kenya eCommerce",
    "Buy online Kenya",
    "Kenyan entrepreneurs",
  ],
  authors: [{ name: "VendLex Technologies Kenya" }],
  creator: "VendLex",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://vendlex.co.ke",
    title: "VendLex | Kenyan Marketplace | Buy. Sell. Grow.",
    description:
      "Kenya's premier business marketplace & growth platform. Connecting customers, businesses, sellers and services in one digital ecosystem.",
    siteName: "VendLex",
    images: [
      {
        url: "/logo/vendlex-logo.png",
        width: 1200,
        height: 630,
        alt: "VendLex Kenya",
      },
    ],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo/favicon.svg", type: "image/svg+xml" },
      { url: "/logo/vendlex-icon.png", type: "image/png" },
    ],
    shortcut: "/logo/favicon.svg",
    apple: "/logo/vendlex-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#087443",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Suspense } from "react";
import { RouteProgressBar } from "@/components/ui/route-progress-bar";

import { MobileBottomNav } from "@/components/navbar/mobile-bottom-nav";
import { AIChatbot } from "@/components/ai/ai-chatbot";

import { PlatformProvider } from "@/lib/store/platform-store";
import { MarketingTracker } from "@/components/marketing/tracker";
import { MarketingPixelScripts } from "@/components/marketing/pixel-scripts";
import { MarketingConsentBanner } from "@/components/marketing/consent-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-brand-off-white dark:bg-brand-dark-bg text-foreground font-sans selection:bg-brand-emerald selection:text-white overflow-x-hidden">
        <Suspense fallback={null}>
          <RouteProgressBar />
          <MarketingTracker />
        </Suspense>
        <MarketingPixelScripts />
        <AuthProvider>
          <PlatformProvider>
            <CartProvider>
              <WishlistProvider>
                <NotificationProvider>
                  <Navbar />
                  <main className="flex-1 flex flex-col pb-16 lg:pb-0">{children}</main>
                  <Footer />
                  <MobileBottomNav />
                  <AIChatbot />
                  <MarketingConsentBanner />
                </NotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </PlatformProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
