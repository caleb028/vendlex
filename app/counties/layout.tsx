import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All 47 Kenyan Counties Directory | Local Businesses & Delivery",
  description:
    "Discover verified local merchants, artisans, agricultural cooperatives, and delivery hubs across all 47 counties of Kenya — from Nairobi, Mombasa, and Kisumu to Garissa and Lodwar.",
  keywords: [
    "47 Kenyan counties directory",
    "Nairobi business directory",
    "Mombasa online shopping",
    "Kisumu local stores",
    "Nakuru merchants",
    "Kenya county delivery hubs",
  ],
  openGraph: {
    title: "All 47 Kenyan Counties Directory | VendLex Kenya",
    description: "Explore verified businesses, local hubs, and courier dispatch across all 47 counties of the Republic of Kenya.",
    url: "https://vendlex.vercel.app/counties",
  },
};

export default function CountiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
