import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo.config";
import { blogService } from "@/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const res = await blogService.getBlogs({ limit: 100, revalidate: 3600 });
    const blogs = res.data?.blogs || [];
    if (blogs.length > 0) {
      const blogUrls: MetadataRoute.Sitemap = blogs.map((b) => ({
        url: `${siteConfig.url}/blog/${b.slug || b._id}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      }));
      return [...routes, ...blogUrls];
    }
  } catch {
    // If backend is not reachable during build, return core routes
  }

  return routes;
}
