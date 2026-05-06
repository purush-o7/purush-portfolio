import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
      },
    ],
    sitemap: "https://purush-o7.vercel.app/sitemap.xml",
  }
}
