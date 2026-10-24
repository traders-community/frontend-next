import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only hosts the app actually serves images from (uploads go to ImageKit)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Client router cache: dynamic pages (home, articles) are always refetched on navigation,
    // fully-prefetched links stay reusable for at most 30s so admin updates show up quickly.
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  allowedDevOrigins: [
    "localhost:3000",
    "localhost:3001",
  ],
};

export default nextConfig;
