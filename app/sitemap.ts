import { prisma } from "@/app/lib/prisma"
import type { MetadataRoute } from "next"

const BASE_URL = "https://marketbased.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
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

  // Dynamic: public user profiles
  let profileRoutes: MetadataRoute.Sitemap = []
  try {
    const users = await prisma.user.findMany({
      select: { username: true, updatedAt: true },
      take: 5000,
    })

    profileRoutes = users.map((user) => ({
      url: `${BASE_URL}/profile/${encodeURIComponent(user.username)}`,
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch {
    // Database unavailable at build time — skip dynamic routes
  }

  return [...staticRoutes, ...profileRoutes]
}
