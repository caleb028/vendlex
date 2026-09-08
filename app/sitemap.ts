import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendlex.vercel.app";
  const now = new Date();

  const routes = [
    { url: "", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/marketplace", priority: 0.9, changeFrequency: "hourly" as const },
    { url: "/businesses", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/services", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/deals", priority: 0.8, changeFrequency: "daily" as const },
    { url: "/discover", priority: 0.7, changeFrequency: "daily" as const },
    { url: "/counties", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/b2b", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/help", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/returns", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
