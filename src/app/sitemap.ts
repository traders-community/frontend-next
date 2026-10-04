import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo.config";
import { blogService, productService } from "@/services";

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
      url: `${siteConfig.url}/fno`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/forex`,
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
    const [blogsRes, productsRes] = await Promise.all([
      blogService.getBlogs({ limit: 100, revalidate: 3600 }).catch(() => null),
      productService.getPublicProducts().catch(() => null),
    ]);

    const blogs = blogsRes?.data?.blogs || [];
    if (blogs.length > 0) {
      const blogUrls: MetadataRoute.Sitemap = blogs
        .filter((b) => b.isPublished !== false)
        .map((b) => ({
          url: `${siteConfig.url}/blog/${b.slug || b._id}`,
          lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.9,
        }));
      routes.push(...blogUrls);
    }

    const products = productsRes?.data?.products || [];
    if (products.length > 0) {
      const productUrls: MetadataRoute.Sitemap = products
        .filter((p) => p.isActive !== false)
        .map((p) => ({
          url: `${siteConfig.url}/product/${p.slug || p._id}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        }));
      routes.push(...productUrls);
    }
  } catch {
    // If backend is not reachable during build, return core routes
  }

  return routes;
}

