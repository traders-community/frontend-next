import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogService, settingsService } from "@/services";
import { constructMetadata } from "@/lib/seo/metadata";
import { ArticleJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/seo.config";
import { formatDate, calculateReadingTime, getPlainExcerpt } from "@/lib/utils";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { PdfAttachment } from "@/components/blog/pdf-attachment";
import { AuthorBio } from "@/components/blog/author-bio";
import { SocialShare } from "@/components/blog/social-share";
import { BlogComments } from "@/components/blog/blog-comments";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Generate dynamic SEO metadata for each blog article
 */
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await blogService.getBlogById(slug, 0);
  const blog = res.data?.blog;

  if (!blog) {
    return constructMetadata({
      title: "Article Not Found",
      description: "The requested research article could not be found on Traders Community.",
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
 * Single Blog Detail Page (SSR + ISR)
 * Layout width matches Navbar & Footer (max-w-7xl px-5) uniformly across all sections
 */
export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;

  // Concurrent server-side data fetching
  const [blogRes, profileRes, commentsRes] = await Promise.all([
    blogService.getBlogById(slug, 0),
    settingsService.getPublicProfile(0),
    blogService.getBlogComments(slug),
  ]);

  const blog = blogRes.data?.blog;
  if (!blog) {
    notFound();
  }

  const profile = profileRes.data?.profile;
  const initialComments = commentsRes.data?.comments || [];
  const readingTime = calculateReadingTime(blog.description);
  const formattedDate = formatDate(blog.createdAt);
  const authorName = profile?.displayName || "Yash Adhiya";
  const articleUrl = `${siteConfig.url}/blog/${blog.slug || slug}`;

  return (
    <>
      {/* Google JSON-LD Structured Data for rich search snippets */}
      <ArticleJsonLd
        title={blog.title}
        description={getPlainExcerpt(blog.description, 160)}
        url={articleUrl}
        image={blog.image}
        datePublished={blog.createdAt}
        dateModified={blog.updatedAt}
        authorName={authorName}
      />

      {/* Main Container - Width matches Sticky Navbar (max-w-4xl lg:max-w-5xl px-4 sm:px-6) */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        {/* Article Header */}
        <header className="w-full text-center px-2 mb-6 sm:mb-8">
          {/* Unified Metadata Row: Category, Date, Reading Time */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium text-primary mb-3.5">
            <span className="font-semibold">{blog.category}</span>
            <span className="text-muted-foreground/60">•</span>
            {formattedDate && (
              <>
                <time dateTime={blog.createdAt}>Published on {formattedDate}</time>
                <span className="text-muted-foreground/60">•</span>
              </>
            )}
            <span>{readingTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight sm:leading-[1.18] tracking-tight">
            {blog.title}
          </h1>

          {/* Subtitle */}
          {blog.subTitle ? (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              {blog.subTitle}
            </p>
          ) : null}

          {/* Author Badge */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs sm:text-sm font-medium text-primary">
            <span>By</span>
            <span className="font-semibold">{authorName}</span>
          </div>
        </header>

        {/* Hero Image Banner - 16:9 Aspect Ratio */}
        <div className="w-full my-6 sm:my-10">
          <div className="relative w-full aspect-video overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 shadow-xl shadow-primary/5 bg-muted">
            {blog.image ? (
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                unoptimized={blog.image.startsWith("http://localhost") || blog.image.startsWith("data:")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card text-primary font-bold text-xl">
                {blog.category}
              </div>
            )}
          </div>
        </div>

        {/* Content Container - Full Width matching Navbar and Footer */}
        <div className="w-full">
          {/* Main Rich-Text Content with Table & Media Overflow Containment */}
          <ArticleRenderer html={blog.description} />

          {/* Attachments (PDF) */}
          {blog.pdf && blog.pdf.name && (
            <PdfAttachment
              blogIdOrSlug={blog.slug || blog._id}
              pdf={blog.pdf}
            />
          )}

          {/* Social Sharing */}
          <SocialShare
            title={blog.title}
            subTitle={blog.subTitle}
          />

          {/* Author Bio Card */}
          <AuthorBio profile={profile} />

          {/* Comments & Discussion */}
          <BlogComments
            blogId={blog._id}
            initialComments={initialComments}
          />
        </div>
      </div>
    </>
  );
}
