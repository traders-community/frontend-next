"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RiTimeLine, RiCalendarLine } from "@remixicon/react";
import { Blog } from "@/types";
import { formatDate, getPlainExcerpt, calculateReadingTime } from "@/lib/utils";

interface BlogCardProps {
  blog: Blog;
  priority?: boolean;
}

export function BlogCard({ blog, priority = false }: BlogCardProps) {
  const [imageError, setImageError] = useState(false);
  const readingTime = calculateReadingTime(blog.description);
  const formattedDate = formatDate(blog.createdAt);
  const excerpt = getPlainExcerpt(blog.description, 140);

  return (
    <article className="group h-full flex flex-col rounded-2xl border border-border/70 bg-card/90 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
      <Link
        href={`/blog/${blog.slug || blog._id}`}
        aria-label={`Read article: ${blog.title}`}
        className="flex flex-col h-full"
      >
        {/* Thumbnail Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
          {!imageError && blog.image ? (
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              unoptimized={blog.image.startsWith("http://localhost") || blog.image.startsWith("data:")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 via-card to-muted text-primary font-bold text-base p-4 text-center">
              <span>{blog.category || "Trading Insight"}</span>
            </div>
          )}

          {/* Category Badge overlay on image */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-md border border-primary/40 text-primary shadow-sm">
              {blog.category}
            </span>
          </div>
        </div>

        {/* Card Body: Only Meta, Title, and Description */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          {/* Meta Information (Date & Reading Time) */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <RiCalendarLine className="w-3.5 h-3.5 text-primary/70" />
                {formattedDate}
              </span>
            )}
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <RiTimeLine className="w-3.5 h-3.5 text-primary/70" />
              {readingTime} min read
            </span>
          </div>

          {/* Article Title */}
          <h2 className="text-base sm:text-lg font-bold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h2>

          {/* Description */}
          <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

export default BlogCard;
