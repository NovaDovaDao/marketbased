import type { MetadataRoute } from "next"

const BASE_URL = "https://marketbased.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/runes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/trading`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ]
}
