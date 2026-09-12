"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Blog } from "@/types";
import { blogService, categoryService } from "@/services";
import { SearchBar } from "./search-bar";
import { CategoryTabs, CategoryTabsSkeleton } from "./category-tabs";
import { BlogCard } from "./blog-card";
import {
  RiLoader4Line,
  RiRefreshLine,
  RiCheckLine,
} from "@remixicon/react";
import { motion } from "motion/react";
import { FadeIn } from "@/components/motion";
import { EASE } from "@/lib/motion";

interface BlogSectionProps {
  initialBlogs?: Blog[];
  initialTotal?: number;
  initialHasMore?: boolean;
  categories?: string[];
  initialCategory?: string;
  initialSearch?: string;
}

const DEFAULT_CATEGORIES = [
  "All",
  "Quarterly Results",
  "Technical Analysis",
  "Fundamentals",
  "Global News",
  "CFA L-1",
  "ICT",
];

const PAGE_SIZE = 9;

/**
 * Pixel-matched articles grid skeleton for initial page load.
 * Keeps layout stable and distinct from the category filter round spinner.
 */
export function ArticlesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-pulse">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="h-full flex flex-col rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs"
        >
          {/* Thumbnail Skeleton */}
          <div className="relative aspect-video w-full bg-muted/80" />

          {/* Card Body Skeleton */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Meta Line */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-16 rounded-sm bg-muted/60" />
                <div className="h-3 w-3 rounded-full bg-muted/40" />
                <div className="h-3 w-20 rounded-sm bg-muted/60" />
              </div>

              {/* Title Skeleton */}
              <div className="space-y-2 mb-4">
                <div className="h-4.5 w-full rounded-sm bg-muted/80" />
                <div className="h-4.5 w-3/4 rounded-sm bg-muted/70" />
              </div>

              {/* Excerpt Skeleton */}
              <div className="space-y-1.5 mb-2">
                <div className="h-3 w-full rounded-sm bg-muted/50" />
                <div className="h-3 w-5/6 rounded-sm bg-muted/50" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Complete BlogSection skeleton for instant page loading without layout shift.
 */
export function BlogSectionSkeleton() {
  return (
    <div suppressHydrationWarning className="w-full flex flex-col items-center">
      {/* Search Bar Skeleton */}
      <div className="w-full max-w-xl mb-10 sm:mb-16 px-4">
        <div className="h-12 w-full rounded-full bg-card/60 border border-border/60 animate-pulse" />
      </div>

      {/* Category Tabs Skeleton */}
      <div className="w-full max-w-5xl px-4 mb-10">
        <CategoryTabsSkeleton />
      </div>

      {/* Articles Grid Skeleton */}
      <div className="w-full max-w-7xl px-5 sm:px-6 mb-16 sm:mb-20 min-h-[360px]">
        <ArticlesGridSkeleton />
      </div>
    </div>
  );
}

export function BlogSection({
  initialBlogs = [],
  initialTotal = 0,
  initialHasMore = false,
  categories,
  initialCategory = "All",
  initialSearch = "",
}: BlogSectionProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get("category") || initialCategory;
  const urlSearch = searchParams?.get("q") || initialSearch;

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [activeCategories, setActiveCategories] = useState<string[]>(
    categories && categories.length > 0 ? categories : []
  );
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(
    !categories || categories.length === 0
  );
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [, setTotal] = useState<number>(initialTotal);

  // Initial cold loading: true ONLY if initialBlogs is empty on first mount
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(
    initialBlogs.length === 0
  );
  // Category/search filtering: round spinner shown when clicking categories or searching
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const requestIdRef = useRef<number>(0);

  // Synchronize URL query params cleanly without reloading page
  const updateUrlParams = useCallback((cat: string, query: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (cat && cat.trim() && cat.trim().toLowerCase() !== "all") {
      url.searchParams.set("category", cat.trim());
    } else {
      url.searchParams.delete("category");
    }

    if (query.trim()) {
      url.searchParams.set("q", query.trim());
    } else {
      url.searchParams.delete("q");
    }

    window.history.replaceState({}, "", url.toString());
  }, []);

  // Primary filtering function: directly requests filtered blogs from the backend
  const fetchFilteredBlogs = useCallback(
    async (
      cat: string,
      query: string,
      targetPage: number = 1,
      append: boolean = false
    ) => {
      const currentRequestId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setIsFiltering(true);
      }

      updateUrlParams(cat, query);

      const categoryParam =
        cat && cat.trim().toLowerCase() !== "all" ? cat.trim() : undefined;
      const searchParam = query.trim() || undefined;

      try {
        const res = await blogService.getBlogs({
          page: targetPage,
          limit: PAGE_SIZE,
          category: categoryParam,
          search: searchParam,
          revalidate: 0,
        });

        if (currentRequestId !== requestIdRef.current) return;

        if (res.data?.success) {
          const fetchedBlogs = res.data.blogs || [];
          setBlogs((prev) => (append ? [...prev, ...fetchedBlogs] : fetchedBlogs));
          setPage(res.data.page || targetPage);
          setHasMore(Boolean(res.data.hasMore));
          setTotal((prevTotal) =>
            res.data.total !== undefined
              ? res.data.total
              : append
              ? prevTotal + fetchedBlogs.length
              : fetchedBlogs.length
          );
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          console.error("Error fetching filtered blogs:", err);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsFiltering(false);
          setIsInitialLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [updateUrlParams]
  );

  // Initial mount: if initialBlogs is empty, fetch fresh data
  useEffect(() => {
    if (initialBlogs.length === 0) {
      setIsInitialLoading(true);
      fetchFilteredBlogs(selectedCategory, searchQuery, 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch active categories on mount to ensure tabs match latest categories in DB
  useEffect(() => {
    if (categories && categories.length > 0) {
      setIsCategoriesLoading(false);
      return;
    }

    setIsCategoriesLoading(true);
    categoryService
      .getPublicCategories(0)
      .then((res) => {
        if (res.data?.success && res.data.categories?.length) {
          const fresh = [
            "All",
            ...res.data.categories
              .filter((c) => c && c.isActive !== false && c.name)
              .map((c) => c.name),
          ];
          const uniqueCats = Array.from(new Set(fresh));
          setActiveCategories((prev) => {
            if (
              prev.length === uniqueCats.length &&
              prev.every((v, i) => v === uniqueCats[i])
            ) {
              return prev;
            }
            return uniqueCats;
          });
        } else {
          setActiveCategories(DEFAULT_CATEGORIES);
        }
      })
      .catch(() => {
        setActiveCategories(DEFAULT_CATEGORIES);
      })
      .finally(() => {
        setIsCategoriesLoading(false);
      });
  }, [categories]);

  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory && !isFiltering) return;
    setSelectedCategory(category);
    fetchFilteredBlogs(category, searchQuery, 1, false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    fetchFilteredBlogs(selectedCategory, query, 1, false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    fetchFilteredBlogs("All", "", 1, false);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    fetchFilteredBlogs("All", "", 1, false);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || isFiltering || isInitialLoading) return;
    fetchFilteredBlogs(selectedCategory, searchQuery, page + 1, true);
  };

  return (
    <div suppressHydrationWarning className="w-full flex flex-col items-center">
      {/* Search Bar Container - Static UI, never in skeleton or loading state */}
      <FadeIn direction="up" distance={18} duration={0.48} className="w-full max-w-xl mb-10 sm:mb-16">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          isLoading={false}
          placeholder="Search reports, strategies, or company insights…"
        />
      </FadeIn>

      {/* Category Tabs Container with clean separation */}
      <FadeIn direction="up" distance={18} duration={0.48} className="w-full max-w-5xl px-4 mb-10">
        <CategoryTabs
          categories={activeCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          isLoading={isCategoriesLoading}
        />
      </FadeIn>

      {/* Articles Grid Container */}
      <div suppressHydrationWarning className="w-full max-w-7xl px-5 sm:px-6 mb-16 sm:mb-20 min-h-[360px]">
        {isInitialLoading ? (
          /* Initial Load: Clean Card Skeletons (NO round load) */
          <ArticlesGridSkeleton />
        ) : isFiltering ? (
          /* Category Filter / Search: Clean Round Spinner */
          <div className="flex flex-col items-center justify-center py-24 min-h-[360px]">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <span className="mt-4 text-sm text-muted-foreground font-medium">Loading blog posts...</span>
          </div>
        ) : blogs.length > 0 ? (
          /* Real Articles Grid with reliable stagger fade-in */
          <div
            key={`${selectedCategory}-${searchQuery}`}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {blogs.map((blog, idx) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.32,
                  delay: Math.min(idx * 0.04, 0.28),
                  ease: EASE.outCubic,
                }}
                className="h-full"
              >
                <BlogCard blog={blog} priority={idx < 4} />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Clean Open Empty State (No Box, No Border) */
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-lg mx-auto min-h-[300px]">
            <h3 className="text-xl sm:text-2xl font-medium mb-3 text-primary">
              No blog posts found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
              We couldn&apos;t find any articles {selectedCategory !== "All" ? `in "${selectedCategory}"` : ""} matching your filters. Try exploring other topics or reset your filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-black transition-all text-sm font-medium cursor-pointer"
            >
              <RiRefreshLine className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination / Load More Section */}
      {!isInitialLoading && !isFiltering && blogs.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-3 mb-24 sm:mb-32 px-4">
          {hasMore ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={handleLoadMore}
              aria-label="Load more articles"
              className="min-h-12 px-8 py-3 rounded-full border border-primary/60 bg-card/60 backdrop-blur-sm text-primary font-semibold text-sm hover:bg-primary hover:text-black active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {loadingMore ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  <span>Loading articles...</span>
                </>
              ) : (
                <span>Load More</span>
              )}
            </button>
          ) : (
            <div
              suppressHydrationWarning
              className="inline-flex items-center gap-2 text-xs text-muted-foreground/80 py-2 px-4 rounded-full bg-card/40 border border-border/50"
            >
              <RiCheckLine className="w-3.5 h-3.5 text-primary" />
              <span>You&apos;ve reached the end of the list</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlogSection;
