import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://marketbased.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/runes", "/trading", "/profile/"],
        disallow: [
          "/api/",
          "/me",
          "/me/",
          "/store",
          "/store/",
          "/trade-rooms",
          "/trade-rooms/",
          "/login",
          "/login/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
