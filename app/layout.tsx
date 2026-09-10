import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { CartProvider } from "@/lib/store/cart-store";
import { AuthProvider } from "@/lib/store/auth-store";
import { WishlistProvider } from "@/lib/store/wishlist-store";
import { NotificationProvider } from "@/lib/store/notification-store";
import { StructuredData } from "@/components/seo/structured-data";
import { MobileAppPrompt } from "@/components/mobile-app-prompt";

export const metadata: Metadata = {
  metadataBase: new URL("https://vendlex.vercel.app"),
  title: {
    default: "VendLex | Kenyan Marketplace & Business Growth Platform",
    template: "%s | VendLex Kenya",
  },
  description:
    "VendLex connects shoppers, sellers, businesses, and verified service providers across all 47 counties in Kenya. Enjoy secure Lipa na M-Pesa escrow payments, live courier delivery tracking, and official cryptographically verified receipts.",
  keywords: [
    "VendLex",
    "VendLex Kenya",
    "Kenya marketplace",
    "Lipa na M-Pesa online shopping",
    "Nairobi business directory",
    "Kenyan online shops",
    "47 counties Kenya ecommerce",
    "Buy online Kenya",
    "Sell online Kenya",
    "Verified Kenyan sellers",
    "Escrow shopping Kenya",
    "VendLex APK download",
    "Android shopping app Kenya",
  ],
  authors: [{ name: "VendLex Technologies Kenya", url: "https://vendlex.vercel.app" }],
  creator: "VendLex Technologies Limited",
  publisher: "VendLex Kenya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://vendlex.vercel.app",
    languages: {
      "en-KE": "https://vendlex.vercel.app",
      "sw-KE": "https://vendlex.vercel.app",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    alternateLocale: ["sw_KE"],
    url: "https://vendlex.vercel.app",
    siteName: "VendLex Kenya",
    title: "VendLex | Kenya's Digital Marketplace | Buy. Sell. Grow.",
    description:
      "Kenya's premier digital commerce ecosystem with direct Lipa na M-Pesa payments, verified Kenyan merchants, and instant delivery across all 47 counties.",
    images: [
      {
        url: "https://vendlex.vercel.app/logo/vendlex-logo.png",
        width: 1200,
        height: 630,
        alt: "VendLex Kenya - Digital Commerce Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VendLex | Kenya's Digital Commerce Ecosystem",
    description:
      "Buy, sell, and grow your Kenyan business with Lipa na M-Pesa, verified escrow, and live dispatch.",
    site: "@vendlex_ke",
    creator: "@vendlex_ke",
    images: ["https://vendlex.vercel.app/logo/vendlex-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
  other: {
    "geo.region": "KE",
    "geo.placename": "Nairobi, Kenya",
    "geo.position": "-1.286389;36.817223",
    "ICBM": "-1.286389, 36.817223",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "VendLex",
    "application-name": "VendLex Kenya",
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
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { RouteProgressBar } from "@/components/ui/route-progress-bar";

import { MobileBottomNav } from "@/components/navbar/mobile-bottom-nav";
import { AIChatbot } from "@/components/ai/ai-chatbot";

import { PlatformProvider } from "@/lib/store/platform-store";
import { MarketingTracker } from "@/components/marketing/tracker";
import { MarketingPixelScripts } from "@/components/marketing/pixel-scripts";
import { MarketingConsentBanner } from "@/components/marketing/consent-banner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable}`}
    >
      <head>
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <StructuredData />
      </head>
      <body className={`${plusJakartaSans.className} min-h-screen flex flex-col bg-brand-off-white dark:bg-brand-dark-bg text-foreground font-sans selection:bg-brand-emerald selection:text-white overflow-x-hidden`}>
        <MobileAppPrompt />
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
