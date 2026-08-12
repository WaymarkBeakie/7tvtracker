import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://7tvtracker.com", changeFrequency: "monthly", priority: 1 },
    { url: "https://7tvtracker.com/terms", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://7tvtracker.com/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];
}