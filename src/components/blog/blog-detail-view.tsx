import React from "react";
import Image from "next/image";
import { Blog, AdminProfile, Comment } from "@/types";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { PdfAttachment } from "@/components/blog/pdf-attachment";
import { AuthorBio } from "@/components/blog/author-bio";
import { SocialShare } from "@/components/blog/social-share";
import { BlogComments } from "@/components/blog/blog-comments";
import { AdminPreviewBanner } from "@/components/blog/admin-preview-banner";
import { FadeIn } from "@/components/motion";

interface BlogDetailViewProps {
  blog: Blog;
  profile?: AdminProfile | null;
  initialComments?: Comment[];
  isDraftPreview?: boolean;
}

export function BlogDetailView({
  blog,
  profile,
  initialComments = [],
  isDraftPreview = false,
}: BlogDetailViewProps) {
  const readingTime = calculateReadingTime(blog.description);
  const formattedDate = formatDate(blog.createdAt);
  const authorName = profile?.displayName || "Yash Adhiya";

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      {/* Floating Admin Preview Banner for unpublished drafts */}
      {isDraftPreview && <AdminPreviewBanner blog={blog} />}

      {/* Article Header */}
      <FadeIn direction="up" distance={18} duration={0.48}>
        <header className="w-full text-center px-2 mb-6 sm:mb-8">
          {/* Unified Metadata Row: Category, Date/Draft status, Reading Time */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium text-primary mb-3.5">
            <span className="font-semibold">{blog.category}</span>
            <span className="text-muted-foreground/60">•</span>
            {blog.isPublished ? (
              formattedDate ? (
                <>
                  <time dateTime={blog.createdAt}>Published on {formattedDate}</time>
                  <span className="text-muted-foreground/60">•</span>
                </>
              ) : null
            ) : (
              <>
                <span className="font-semibold text-primary">Draft</span>
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
      </FadeIn>

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

        {/* Comments & Discussion - Hidden completely on draft previews */}
        {!isDraftPreview && (
          <BlogComments
            blogId={blog._id}
            initialComments={initialComments}
          />
        )}
      </div>
    </div>
  );
}

export default BlogDetailView;
