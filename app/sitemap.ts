import { MetadataRoute } from "next";
import { MOCK_PRODUCTS, MOCK_BUSINESSES, KENYAN_COUNTIES } from "@/lib/data/kenya-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendlex.vercel.app";
  const now = new Date();

  // Core static pages
  const staticRoutes = [
    { url: "", priority: 1.0, changeFrequency: "hourly" as const },
    { url: "/marketplace", priority: 0.95, changeFrequency: "hourly" as const },
    { url: "/download", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/app", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/businesses", priority: 0.85, changeFrequency: "daily" as const },
    { url: "/services", priority: 0.85, changeFrequency: "daily" as const },
    { url: "/deals", priority: 0.85, changeFrequency: "hourly" as const },
    { url: "/counties", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/discover", priority: 0.75, changeFrequency: "daily" as const },
    { url: "/b2b", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/pricing", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/advertise", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/community", priority: 0.65, changeFrequency: "daily" as const },
    { url: "/help", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
    { url: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
    { url: "/returns", priority: 0.3, changeFrequency: "monthly" as const },
  ];

  // Dynamic Product Pages
  const productRoutes = MOCK_PRODUCTS.map((p) => ({
    url: `/products/${p.slug}`,
    priority: 0.8,
    changeFrequency: "daily" as const,
  }));

  // Dynamic Business Storefronts
  const businessRoutes = MOCK_BUSINESSES.map((b) => ({
    url: `/businesses/${b.slug}`,
    priority: 0.75,
    changeFrequency: "daily" as const,
  }));

  const allRoutes = [...staticRoutes, ...productRoutes, ...businessRoutes];

  return allRoutes.map((r) => ({
    url: `${baseUrl}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
