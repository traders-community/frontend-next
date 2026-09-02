import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
