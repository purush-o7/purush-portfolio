import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:          "https://purush-o7.vercel.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority:     1,
    },
    {
      url:          "https://purush-o7.vercel.app/kovil-lens",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority:     0.6,
    },
  ]
}
