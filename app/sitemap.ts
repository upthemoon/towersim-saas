import type { MetadataRoute } from "next";

const BASE = "https://towersim.upthemoon.co.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/guide`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/signin`, lastModified, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/legal/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/tokushoho`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
