import React from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { blogService, settingsService } from "@/services";
import { constructMetadata } from "@/lib/seo/metadata";
import { ArticleJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/seo.config";
import { getPlainExcerpt } from "@/lib/utils";
import { BlogDetailView } from "@/components/blog/blog-detail-view";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ previewToken?: string }>;
}

// Enable ISR Caching on Vercel Edge with 60-second background revalidation
export const revalidate = 60;

/**
 * Generate dynamic SEO metadata for each blog article.
 * Unpublished articles are strictly hidden behind standard 404 metadata for all non-admin visitors.
 */
export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  let token = resolvedSearchParams.previewToken;

  if (!token) {
    try {
      const cookieStore = await cookies();
      const raw = cookieStore.get("admin_token")?.value || cookieStore.get("token")?.value;
      token = raw ? decodeURIComponent(raw) : undefined;
    } catch {
      // Static build context
    }
  }

  const res = await blogService.getBlogById(slug, token ? 0 : 60, token);
  const blog = res.data?.blog;

  // If blog is not found OR is unpublished without admin authorization:
  // Return standard 404 metadata with zero leak of preview/draft existence.
  if (!blog || (!blog.isPublished && !token)) {
    return constructMetadata({
      title: "404 - Page Not Found",
      description:
        "The page you are looking for does not exist, has been removed, or is temporarily unavailable on Traders Community.",
      noIndex: true,
    });
  }

  // Unpublished article - strictly block indexing from web crawlers
  if (!blog.isPublished) {
    return constructMetadata({
      title: `[Draft Preview] ${blog.title}`,
      description: "Unpublished article preview. Accessible to admins only.",
      noIndex: true,
    });
  }

  const excerpt = getPlainExcerpt(blog.description, 160);
  const pageUrl = `/blog/${blog.slug || slug}`;

  return constructMetadata({
    title: blog.title,
    description: excerpt || blog.subTitle || siteConfig.description,
    image: blog.image,
    canonicalUrl: pageUrl,
    type: "article",
    publishedTime: blog.createdAt,
    modifiedTime: blog.updatedAt,
    authors: [siteConfig.author],
  });
}

/**
 * Single Blog Detail Page (SSR + ISR with Admin Preview)
 *
 * 1. Published article: Renders instantly via SSR with Edge ISR caching.
 * 2. Unpublished article + Admin: Renders draft preview with AdminPreviewBanner.
 * 3. Unpublished article + Public user: Strictly renders standard 404 (notFound())
 *    without any loading indicator or hint that a draft exists.
 */
export default async function BlogDetailPage({ params, searchParams }: BlogPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  let token = resolvedSearchParams.previewToken;

  if (!token) {
    try {
      const cookieStore = await cookies();
      const raw = cookieStore.get("admin_token")?.value || cookieStore.get("token")?.value;
      token = raw ? decodeURIComponent(raw) : undefined;
    } catch {
      // Static build context
    }
  }

  // Concurrent server-side data fetching with ISR caching (or no-store for admin preview)
  const [blogRes, profileRes, commentsRes] = await Promise.all([
    blogService.getBlogById(slug, token ? false : 60, token),
    settingsService.getPublicProfile(60),
    blogService.getBlogComments(slug, token),
  ]);

  const blog = blogRes.data?.blog;
  const profile = profileRes.data?.profile;
  const initialComments = commentsRes.data?.comments || [];

  // If blog is not found OR if unpublished and not an authorized admin:
  // Immediately call notFound() to render standard 404 page directly.
  if (!blog) {
    notFound();
  }

  if (!blog.isPublished && !token) {
    notFound();
  }

  const isDraftPreview = !blog.isPublished;
  const authorName = profile?.displayName || "Yash Adhiya";
  const articleUrl = `${siteConfig.url}/blog/${blog.slug || slug}`;

  return (
    <>
      {/* Google JSON-LD Structured Data for rich search snippets (suppressed on draft previews) */}
      {!isDraftPreview && (
        <ArticleJsonLd
          title={blog.title}
          description={getPlainExcerpt(blog.description, 160)}
          url={articleUrl}
          image={blog.image}
          datePublished={blog.createdAt}
          dateModified={blog.updatedAt}
          authorName={authorName}
        />
      )}

      {/* Main Article Content */}
      <BlogDetailView
        blog={blog}
        profile={profile}
        initialComments={initialComments}
        isDraftPreview={isDraftPreview}
      />
    </>
  );
}
