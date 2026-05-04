import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  allowedDevOrigins: ["192.168.29.31"],
};

export default nextConfig;
