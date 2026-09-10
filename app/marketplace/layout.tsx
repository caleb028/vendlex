import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kenya Marketplace | Buy Verified Products with Lipa na M-Pesa",
  description:
    "Explore Kenya's verified marketplace catalog. Shop authentic electronics, fashion, agricultural produce, home appliances, and health essentials across all 47 counties.",
  keywords: [
    "Kenya online marketplace",
    "Buy online Nairobi",
    "M-Pesa escrow marketplace",
    "Verified Kenyan sellers",
    "Kenya electronics online",
    "Authentic products Kenya",
  ],
  openGraph: {
    title: "Marketplace | VendLex Kenya - Shop Across 47 Counties",
    description: "Browse verified Kenyan merchants, compare prices, and order with instant Lipa na M-Pesa STK push and guaranteed delivery tracking.",
    url: "https://vendlex.vercel.app/marketplace",
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
