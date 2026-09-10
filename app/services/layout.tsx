import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Kenyan Trades & Professional Services Directory | VendLex",
  description:
    "Hire verified Kenyan plumbers, electricians, graphic designers, legal advisers, solar technicians, and auto mechanics across all 47 counties with escrow payment security.",
  keywords: [
    "Hire professionals Kenya",
    "Nairobi electricians plumbers",
    "Kenyan solar technicians",
    "Verified service providers Kenya",
    "Fundi directory Nairobi",
  ],
  openGraph: {
    title: "Verified Kenyan Trades & Professional Services | VendLex Kenya",
    description: "Book certified professionals and skilled trades across Kenya with guaranteed escrow payment protection.",
    url: "https://vendlex.vercel.app/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
