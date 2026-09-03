import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Synchronize custom icon.png to replace default Vercel favicon
try {
  const iconSrc = path.join(process.cwd(), "public", "icon.png");
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, path.join(process.cwd(), "src", "app", "icon.png"));
    fs.copyFileSync(iconSrc, path.join(process.cwd(), "src", "app", "favicon.ico"));
    fs.copyFileSync(iconSrc, path.join(process.cwd(), "public", "favicon.ico"));
  }
} catch {
  // Silent fail
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
