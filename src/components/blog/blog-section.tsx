"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Blog } from "@/types";
import { blogService, categoryService } from "@/services";
import { SearchBar } from "./search-bar";
import { CategoryTabs } from "./category-tabs";
import { BlogCard } from "./blog-card";
import {
  RiLoader4Line,
  RiRefreshLine,
  RiCheckLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

interface BlogSectionProps {
  initialBlogs?: Blog[];
  initialTotal?: number;
  initialHasMore?: boolean;
  categories?: string[];
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

export function BlogSection({
  initialBlogs = [],
  initialTotal = 0,
  initialHasMore = false,
  categories = DEFAULT_CATEGORIES,
}: BlogSectionProps) {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category") || "All";
  const initialQueryParam = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(initialQueryParam);
  const [activeCategories, setActiveCategories] = useState<string[]>(categories);
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [, setTotal] = useState<number>(initialTotal);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const isInitialMount = useRef<boolean>(true);
  const requestIdRef = useRef<number>(0);

  // Sync state if server prop updates
  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategories(categories);
    }
  }, [categories]);

  // Client-side auto-refresh on mount, tab focus, or navigation back to Home
  useEffect(() => {
    const refreshCategories = () => {
      categoryService
        .getPublicCategories(0)
        .then((res) => {
          if (res.data?.success && res.data.categories) {
            const freshCategories = [
              "All",
              ...res.data.categories
                .filter((c) => c.isActive !== false)
                .map((c) => c.name),
            ];
            setActiveCategories((prev) => {
              if (
                prev.length === freshCategories.length &&
                prev.every((val, index) => val === freshCategories[index])
              ) {
                return prev;
              }
              return freshCategories;
            });
          }
        })
        .catch(() => {});
    };

    refreshCategories();

    window.addEventListener("focus", refreshCategories);
    return () => {
      window.removeEventListener("focus", refreshCategories);
    };
  }, []);

  // Synchronize URL query params without reloading the page
  const updateUrlParams = useCallback((cat: string, query: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (cat && cat !== "All") {
      url.searchParams.set("category", cat);
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

  // Fetch blogs handler with race-condition guard
  const fetchBlogs = useCallback(
    async (cat: string, search: string, targetPage: number = 1, append: boolean = false) => {
      const currentRequestId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else if (blogs.length === 0) {
        setIsInitialLoading(true);
      }

      try {
        const res = await blogService.getBlogs({
          page: targetPage,
          limit: PAGE_SIZE,
          category: cat,
          search,
        });

        // If a newer search or category was triggered while waiting, ignore stale response
        if (currentRequestId !== requestIdRef.current) return;

        if (res.data?.success) {
          const fetchedBlogs = res.data.blogs || [];
          setBlogs((prev) => (append ? [...prev, ...fetchedBlogs] : fetchedBlogs));
          setPage(res.data.page || targetPage);
          setHasMore(Boolean(res.data.hasMore));
          setTotal(res.data.total ?? (append ? blogs.length + fetchedBlogs.length : fetchedBlogs.length));
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          console.error("Error fetching blogs:", err);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsInitialLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [blogs.length]
  );

  // Handle category or search change
  useEffect(() => {
    // Skip on first mount if initial SSR data is already present
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialBlogs.length > 0 && selectedCategory === "All" && !searchQuery) {
        return;
      }
    }

    updateUrlParams(selectedCategory, searchQuery);
    fetchBlogs(selectedCategory, searchQuery, 1, false);
  }, [selectedCategory, searchQuery, fetchBlogs, initialBlogs.length, updateUrlParams]);

  // If the currently selected category is no longer active, fallback gracefully to "All"
  useEffect(() => {
    if (
      selectedCategory !== "All" &&
      activeCategories.length > 1 &&
      !activeCategories.includes(selectedCategory)
    ) {
      setSelectedCategory("All");
      updateUrlParams("All", searchQuery);
      fetchBlogs("All", searchQuery, 1, false);
    }
  }, [activeCategories, selectedCategory, searchQuery, updateUrlParams, fetchBlogs]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchBlogs(selectedCategory, searchQuery, page + 1, true);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search Bar Container with generous vertical breathing room */}
      <div className="w-full max-w-xl mb-10 sm:mb-16">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search reports, strategies, or company insights…"
        />
      </div>

      {/* Category Tabs Container with clean separation */}
      <div className="w-full max-w-5xl px-4 mb-10">
        <CategoryTabs
          categories={activeCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />
      </div>

      {/* Articles Grid Container (No flickering, smooth transition) */}
      <div className="w-full max-w-7xl px-5 sm:px-6 mb-16 sm:mb-20">
        {isInitialLoading ? (
          /* Clean regular spinner loader (No skeleton flicker) */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <span className="mt-4 text-sm text-muted-foreground font-medium">Loading blog posts...</span>
          </div>
        ) : blogs.length > 0 ? (
          /* Real Articles Grid with 2 columns on tablet and 3/4 on desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {blogs.map((blog, idx) => (
              <BlogCard key={blog._id} blog={blog} priority={idx < 4} />
            ))}
          </div>
        ) : (
          /* Clean Open Empty State (No Box, No Border) */
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 max-w-lg mx-auto">
            <h3 className="text-xl sm:text-2xl font-medium mb-3 text-primary">
              No blog posts found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
              We couldn&apos;t find any articles that match your search or selected category. Try exploring other topics or reset your filters.
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
      {!isInitialLoading && blogs.length > 0 && (
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
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/80 py-2 px-4 rounded-full bg-card/40 border border-border/50">
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
