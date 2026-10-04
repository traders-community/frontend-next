"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RiStarFill,
  RiStarLine,
  RiShieldCheckLine,
  RiPencilLine,
  RiChat1Line,
  RiArrowDownLine,
  RiLoader4Line,
  RiFilterLine,
} from "@remixicon/react";
import { ProductReview, ProductReviewStats } from "@/types";
import { productReviewService } from "@/services/product-review.service";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
import { ProductReviewModal } from "./product-review-modal";

const REVIEWS_PER_PAGE = 5;

/**
 * Reusable partial/half-star visual renderer
 * Supports whole, half, and exact decimal fills (e.g. 4.5, 4.8, 3.7, 4.1, 5.0)
 */
function StarRatingDisplay({
  value,
  size = "md",
}: {
  value: number;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const iconSize =
    size === "xs"
      ? "h-3 w-3"
      : size === "sm"
      ? "h-3.5 w-3.5"
      : size === "md"
      ? "h-5 w-5"
      : "h-6 w-6";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(100, Math.round((value - (i - 1)) * 100)));
        return (
          <div key={i} className={cn("relative inline-block", iconSize)}>
            <RiStarLine className={cn("absolute inset-0 text-muted-foreground/35", iconSize)} />
            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden text-amber-400 fill-amber-400"
                style={{ width: `${fill}%` }}
              >
                <RiStarFill className={cn("text-amber-400 fill-amber-400", iconSize)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
  initialStats?: ProductReviewStats;
  initialReviews?: ProductReview[];
  initialTotal?: number;
}

export function ProductReviewsSection({
  productId,
  productTitle,
  initialStats,
  initialReviews = [],
  initialTotal,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [stats, setStats] = useState<ProductReviewStats | undefined>(initialStats);
  const [totalReviews, setTotalReviews] = useState<number>(
    initialTotal ?? initialStats?.totalReviews ?? initialReviews.length
  );
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Filtering & Sorting State
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sentinel ref for infinite scroll observer (just like blog-comments)
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch reviews based on active filters and page
  const fetchReviewsData = useCallback(
    async (
      pageToFetch: number,
      ratingFilter: number | null,
      sortOrder: "newest" | "highest" | "lowest",
      append: boolean = false
    ) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsFilterLoading(true);
        }

        const res = await productReviewService.getProductReviews(productId, {
          page: pageToFetch,
          limit: REVIEWS_PER_PAGE,
          rating: ratingFilter ?? undefined,
          sort: sortOrder,
        });

        if (res.data?.success) {
          const fetchedReviews = res.data.reviews || [];
          if (append) {
            setReviews((prev) => {
              const existingIds = new Set(prev.map((r) => r._id || r.id));
              const uniqueNew = fetchedReviews.filter((r) => !existingIds.has(r._id || r.id));
              return [...prev, ...uniqueNew];
            });
          } else {
            setReviews(fetchedReviews);
          }

          // Aggregate stats always reflect overall product reviews
          if (res.data.stats) {
            setStats(res.data.stats);
          }

          if (res.data.total !== undefined) {
            setTotalReviews(res.data.total);
          }
          setPage(pageToFetch);
        }
      } catch (err) {
        console.error("Failed to fetch product reviews:", err);
      } finally {
        setIsLoadingMore(false);
        setIsFilterLoading(false);
      }
    },
    [productId]
  );

  // Refetch when rating filter or sort changes
  const handleFilterChange = (star: number | null) => {
    setSelectedRating(star);
    setPage(1);
    fetchReviewsData(1, star, sortBy, false);
  };

  const handleSortChange = (newSort: "newest" | "highest" | "lowest") => {
    setSortBy(newSort);
    setPage(1);
    fetchReviewsData(1, selectedRating, newSort, false);
  };

  // Load next page of reviews (Pagination like blog comments)
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || isFilterLoading || reviews.length >= totalReviews) return;
    const nextPage = page + 1;
    await fetchReviewsData(nextPage, selectedRating, sortBy, true);
  }, [isLoadingMore, isFilterLoading, reviews.length, totalReviews, page, fetchReviewsData, selectedRating, sortBy]);

  // Set up IntersectionObserver for Infinite Scroll (matching comments behaviour)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const hasMore = reviews.length < totalReviews;
    if (!sentinel || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px", // Trigger smoothly as user approaches end
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, reviews.length, totalReviews, isLoadingMore]);

  // Overall product stats for scorecard
  const overallTotal = stats?.totalReviews ?? initialStats?.totalReviews ?? totalReviews;
  const overallAvg = stats?.averageRating ?? initialStats?.averageRating ?? 0;
  const distribution = stats?.distribution ?? initialStats?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const hasMore = reviews.length < totalReviews;

  return (
    <section id="reviews" className="w-full scroll-mt-24 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              Customer Reviews
            </h2>
            {overallTotal > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                {overallTotal}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real feedback and ratings from verified buyers.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2 self-start sm:self-auto text-black font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer"
        >
          <RiPencilLine className="h-4 w-4" />
          <span>Write a Review</span>
        </Button>
      </div>

      {/* Aggregate Rating Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 sm:gap-8 items-center p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-xs">
        {/* Left: Overall Rating Block */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-border/70">
          <div className="text-5xl sm:text-6xl font-extrabold text-foreground font-heading tracking-tight">
            {overallTotal > 0 ? overallAvg.toFixed(1) : "—"}
          </div>
          <div className="my-2.5">
            {overallTotal > 0 ? (
              <StarRatingDisplay value={overallAvg} size="md" />
            ) : (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <RiStarLine key={star} className="h-5 w-5 text-muted-foreground/35" />
                ))}
              </div>
            )}
          </div>
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">
            {overallTotal > 0
              ? `Based on ${overallTotal} verified ${overallTotal === 1 ? "review" : "reviews"}`
              : "No reviews yet"}
          </div>
          {overallTotal > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <RiShieldCheckLine className="h-3.5 w-3.5" />
              <span>100% Verified Buyers</span>
            </div>
          )}
        </div>

        {/* Right: Star Distribution Bars with distinct visible tracks */}
        <div className="flex flex-col justify-center gap-3 px-1 sm:px-3">
          {([5, 4, 3, 2, 1] as const).map((starNumber) => {
            const count = distribution[starNumber] || 0;
            const percentage = overallTotal > 0 ? Math.round((count / overallTotal) * 100) : 0;
            const isSelected = selectedRating === starNumber;

            return (
              <button
                key={starNumber}
                type="button"
                onClick={() => handleFilterChange(isSelected ? null : starNumber)}
                className={cn(
                  "flex items-center gap-3 text-xs w-full group rounded-xl px-2 py-1 -mx-2 transition-all cursor-pointer text-left",
                  isSelected
                    ? "bg-primary/10 border border-primary/25"
                    : "hover:bg-surface/50 border border-transparent"
                )}
                title={count > 0 ? `Filter by ${starNumber} star reviews` : `0 reviews`}
              >
                {/* Star Label */}
                <div className="flex items-center gap-1.5 w-14 shrink-0 font-semibold text-foreground">
                  <span>{starNumber}</span>
                  <RiStarFill className="h-3.5 w-3.5 text-amber-400" />
                </div>

                {/* Progress Bar Track: Clearly visible in dark & light themes */}
                <div className="flex-1 h-2.5 sm:h-3 rounded-full bg-slate-800/80 dark:bg-white/[0.08] border border-white/[0.06] overflow-hidden relative shadow-inner">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      count > 0
                        ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-primary shadow-xs"
                        : "bg-transparent"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Count & Percentage */}
                <div className="w-16 text-right shrink-0 text-muted-foreground font-mono text-[11px] tabular-nums group-hover:text-foreground transition-colors">
                  <span>{count}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-1">({percentage}%)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Bar (shown when overall reviews > 0) */}
      {overallTotal > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <RiFilterLine className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </span>

            <button
              type="button"
              onClick={() => handleFilterChange(null)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                selectedRating === null
                  ? "bg-primary text-black font-bold shadow-xs"
                  : "bg-surface border border-border/80 text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              All ({overallTotal})
            </button>

            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = distribution[star] || 0;
              if (count === 0 && selectedRating !== star) return null;
              const active = selectedRating === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleFilterChange(active ? null : star)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                    active
                      ? "bg-primary text-black font-bold shadow-xs"
                      : "bg-surface border border-border/80 text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  <span>{star}</span>
                  <RiStarFill className={cn("h-3 w-3", active ? "text-black" : "text-amber-400")} />
                  <span>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label htmlFor="review-sort" className="text-xs text-muted-foreground font-medium">
              Sort by:
            </label>
            <select
              id="review-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as "newest" | "highest" | "lowest")}
              className="text-xs bg-surface border border-border/80 rounded-xl px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews Feed: Full-Width Clean Card Stream */}
      <div className="space-y-4">
        {isFilterLoading ? (
          <div className="p-10 rounded-3xl border border-border/80 bg-card/60 flex flex-col items-center justify-center gap-3">
            <RiLoader4Line className="h-6 w-6 text-primary animate-spin" />
            <span className="text-xs font-medium text-muted-foreground">Updating reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-border/80 bg-card/60 text-center flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <RiChat1Line className="h-7 w-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {selectedRating !== null ? `No ${selectedRating}-star reviews found` : "No reviews published yet"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
              {selectedRating !== null ? (
                <button
                  type="button"
                  onClick={() => handleFilterChange(null)}
                  className="text-primary hover:underline font-semibold cursor-pointer"
                >
                  Clear filter to see all reviews
                </button>
              ) : (
                "Have you joined this track? Be the first verified buyer to share your experience with the community."
              )}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5 w-full">
            {reviews.map((rev) => (
              <article
                key={rev._id || rev.id}
                className="w-full p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/90 hover:border-border transition-all duration-200 shadow-xs space-y-3.5"
              >
                {/* Top Row: User Avatar, Name, Verified Badge, Stars & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-base border border-primary/30 shadow-xs">
                      {rev.name ? rev.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                          {rev.name}
                        </span>
                        <span
                          title="Verified Buyer (Confirmed Purchase)"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full"
                        >
                          <RiShieldCheckLine className="h-3 w-3 shrink-0" />
                          <span>Verified Buyer</span>
                        </span>
                      </div>
                      <time className="text-[11px] text-muted-foreground block mt-0.5">
                        {formatDate(rev.createdAt)}
                      </time>
                    </div>
                  </div>

                  {/* Star Rating Badge on Right */}
                  <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-surface/90 px-3 py-1.5 rounded-xl border border-border/70 shadow-xs">
                    <StarRatingDisplay value={rev.rating} size="sm" />
                    <span className="text-xs font-bold text-foreground font-mono">
                      {Number(rev.rating).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Optional Review Title */}
                {rev.title && (
                  <h4 className="font-bold text-sm sm:text-base text-foreground">
                    {rev.title}
                  </h4>
                )}

                {/* Review Body */}
                <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                  {rev.comment}
                </p>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Section (Load more reviews just like comments) */}
        {hasMore && (
          <div className="flex flex-col items-center justify-center pt-6 gap-3">
            <Button
              variant="outline"
              size="md"
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              className="gap-2 px-7 py-2.5 rounded-xl border-border/80 hover:border-primary/60 hover:bg-surface font-semibold text-sm transition-all cursor-pointer shadow-xs"
            >
              {isLoadingMore ? (
                <>
                  <RiLoader4Line className="h-4 w-4 text-primary animate-spin" />
                  <span>Loading more reviews...</span>
                </>
              ) : (
                <>
                  <span>Load More Reviews</span>
                  <RiArrowDownLine className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing {reviews.length} of {totalReviews} reviews</span>
              <div className="w-20 h-1.5 rounded-full bg-slate-800/80 dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((reviews.length / totalReviews) * 100))}%` }}
                />
              </div>
            </div>

            {/* Infinite scroll sentinel observer ref */}
            <div ref={sentinelRef} className="h-2 w-full" />
          </div>
        )}

        {!hasMore && totalReviews > REVIEWS_PER_PAGE && (
          <p className="text-xs text-center text-muted-foreground/75 pt-6">
            You have reached the end of reviews.
          </p>
        )}
      </div>

      {/* Review Modal Dialog */}
      <ProductReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        productTitle={productTitle}
        onSuccess={() => {
          setSelectedRating(null);
          setPage(1);
          fetchReviewsData(1, null, sortBy, false);
        }}
      />
    </section>
  );
}

export default ProductReviewsSection;
