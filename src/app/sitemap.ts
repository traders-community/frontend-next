import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo.config";
import { CACHE_TAGS } from "@/lib/api/cache-tags";
import { blogService, productService } from "@/services";
import { Blog } from "@/types";

// The public blog endpoint caps `limit` at 24, so the sitemap walks every page.
const BLOG_PAGE_SIZE = 24;
const MAX_BLOG_PAGES = 100;
const SITEMAP_REVALIDATE_SECONDS = 3600;

async function fetchAllPublishedBlogs(): Promise<Blog[]> {
  const blogs: Blog[] = [];
  for (let page = 1; page <= MAX_BLOG_PAGES; page++) {
    const res = await blogService.getBlogs({
      page,
      limit: BLOG_PAGE_SIZE,
      revalidate: SITEMAP_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.blogs],
    });
    if (!res.data?.success) break;
    blogs.push(...(res.data.blogs || []));
    if (!res.data.hasMore) break;
  }
  return blogs;
}

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
    const [blogs, productsRes] = await Promise.all([
      fetchAllPublishedBlogs(),
      productService.getPublicProducts(),
    ]);

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

