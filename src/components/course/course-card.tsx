"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import {
  RiArrowRightLine,
  RiStarFill,
  RiCheckLine,
  RiGraduationCapLine,
} from "@remixicon/react";

interface CourseCardProps {
  product: Product;
  priority?: boolean;
}

export function CourseCard({ product, priority = false }: CourseCardProps) {
  const productUrl = `/product/${product.slug || product._id}`;

  // Clean short description by stripping any stray HTML tags
  const cleanDescription = (product.shortDescription || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .trim();

  // All highlight points without any truncation or slicing
  const highlightPoints = product.points || [];

  // Rating fallback: If product has reviews, show calculated rating, otherwise 5.0
  const rating =
    product.averageRating && product.averageRating > 0
      ? product.averageRating.toFixed(1)
      : "5.0";

  const reviewCount =
    product.reviewCount !== undefined && product.reviewCount > 0
      ? product.reviewCount
      : 1;

  return (
    <article className="group relative w-full rounded-2xl sm:rounded-3xl border border-border/80 dark:border-white/10 bg-card overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/30 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr] items-stretch">
        {/* ---------------- LEFT: Full Square Image (1:1 Ratio) ---------------- */}
        <Link
          href={productUrl}
          className="relative w-full aspect-square md:aspect-auto md:h-full min-h-[340px] overflow-hidden bg-muted/30 block"
          aria-label={`View course: ${product.title}`}
        >
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-card to-background text-primary">
              <RiGraduationCapLine className="h-16 w-16 opacity-80" />
              <span className="text-xs font-semibold mt-2 text-muted-foreground">
                Traders Community
              </span>
            </div>
          )}
          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </Link>

        {/* ---------------- RIGHT: Full Untrimmed Course Content ---------------- */}
        <div className="p-6 sm:p-7 lg:p-9 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              <Link
                href={productUrl}
                className="hover:text-primary transition-colors"
              >
                {product.title}
              </Link>
            </h2>

            {/* Rating & Review Count */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-400">
                <RiStarFill className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {rating}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Short Description (Full text, NO line-clamp trimming) */}
            {cleanDescription && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {cleanDescription}
              </p>
            )}

            {/* Course Highlights (All points displayed in full, NO truncate) */}
            {highlightPoints.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Course Highlights
                </p>
                <ul className="space-y-2">
                  {highlightPoints.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/85 font-medium leading-snug"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] mt-0.5">
                        <RiCheckLine className="h-3 w-3" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action CTA Row */}
          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-start sm:justify-end">
            <Link
              href={productUrl}
              className="inline-flex h-11 items-center justify-center gap-2 px-7 sm:px-8 rounded-full bg-primary text-black font-bold text-xs sm:text-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 transition-all duration-150 cursor-pointer w-full sm:w-auto"
            >
              <span>View Details</span>
              <RiArrowRightLine className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
