import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Hot Deals & Flash Discounts in Kenya | VendLex",
  description:
    "Save up to 40% on verified electronics, home appliances, smartphones, and fashion. Live flash deals with instant Lipa na M-Pesa escrow protection.",
  keywords: [
    "Kenya flash deals",
    "Discounts Nairobi",
    "Black Friday Kenya deals",
    "Cheap smartphones Nairobi",
    "VendLex hot deals",
  ],
  openGraph: {
    title: "Today's Hot Deals & Flash Discounts | VendLex Kenya",
    description: "Verified merchant discounts across Kenya. Save big on authentic goods with secure escrow protection.",
    url: "https://vendlex.vercel.app/deals",
  },
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
