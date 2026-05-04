import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF to browsers that support it, WebP as fallback.
    // Next.js converts at request-time and caches the result.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
