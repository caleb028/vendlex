import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verified Kenyan Business Storefronts & Brands Directory | VendLex",
  description:
    "Explore registered and verified Kenyan companies, manufacturers, boutique brands, and local retailers. Connect directly with owners, view ratings, and order goods.",
  keywords: [
    "Kenya business directory",
    "Verified storefronts Nairobi",
    "Kenyan SME directory",
    "Kenyan wholesale manufacturers",
    "VendLex verified stores",
  ],
  openGraph: {
    title: "Verified Kenyan Business Storefronts & Brands | VendLex Kenya",
    description: "Browse verified local stores and manufacturers across Kenya. Direct contact, authenticated reviews, and guaranteed deliveries.",
    url: "https://vendlex.vercel.app/businesses",
  },
};

export default function BusinessesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
