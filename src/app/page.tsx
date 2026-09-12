import { Suspense } from "react";
import { BlogSection } from "@/components/blog/blog-section";
import { TradingBackground } from "@/components/common/trading-background";
import { FadeIn } from "@/components/motion";
import { blogService, categoryService } from "@/services";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  canonicalUrl: "/",
  image: "/featured_img.jpg",
});

// Enable Incremental Static Regeneration (ISR) with 60-second edge cache revalidation
export const revalidate = 60;

async function getInitialHomeData() {
  try {
    const [blogsRes, categoriesRes] = await Promise.all([
      blogService.getBlogs({ page: 1, limit: 9, revalidate: 60 }),
      categoryService.getPublicCategories(60),
    ]);

    const initialBlogs = blogsRes.data?.blogs || [];
    const initialTotal = blogsRes.data?.total || initialBlogs.length;
    const initialHasMore = Boolean(blogsRes.data?.hasMore);

    const categoryNames = [
      "All",
      ...(categoriesRes.data?.categories || [])
        .filter((c) => c.isActive !== false)
        .map((c) => c.name),
    ];

    return {
      initialBlogs,
      initialTotal,
      initialHasMore,
      categories: categoryNames.length > 1 ? categoryNames : undefined,
    };
  } catch (error) {
    console.error("Initial home data fetch error (will hydrate client-side):", error);
    return {
      initialBlogs: [],
      initialTotal: 0,
      initialHasMore: false,
      categories: undefined,
    };
  }
}

/**
 * High-performance, pixel-matched skeleton fallback.
 * Prevents Cumulative Layout Shift (CLS) and renders immediately on the client
 * while the async backend data streams in.
 */
function BlogSectionLoadingFallback() {
  return (
    <div suppressHydrationWarning className="w-full flex flex-col items-center" aria-busy="true" aria-label="Loading research articles">
      {/* Category Tabs Skeleton */}
      <div className="w-full max-w-5xl px-4 mb-10 overflow-hidden animate-pulse">
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-nowrap w-max mx-auto py-3">
          <div className="h-9 w-16 sm:w-20 rounded-full bg-primary/30" />
          <div className="h-9 w-28 sm:w-36 rounded-full bg-muted/60 border border-border/40" />
          <div className="h-9 w-28 sm:w-36 rounded-full bg-muted/60 border border-border/40" />
          <div className="h-9 w-24 sm:w-32 rounded-full bg-muted/60 border border-border/40 hidden sm:block" />
          <div className="h-9 w-24 sm:w-28 rounded-full bg-muted/60 border border-border/40 hidden md:block" />
        </div>
      </div>

      {/* Responsive Articles Grid Skeleton (Matches real BlogCard grid) */}
      <div className="w-full max-w-7xl px-5 sm:px-6 mb-16 sm:mb-20 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-full flex flex-col rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xs"
            >
              {/* Thumbnail Skeleton */}
              <div className="relative aspect-video w-full bg-muted/80 flex items-start justify-start p-3">
                <div className="h-5 w-20 rounded-full bg-background/70" />
              </div>

              {/* Card Body Skeleton */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta Line (Date & Reading Time) */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-16 rounded-sm bg-muted/60" />
                    <div className="h-3 w-3 rounded-full bg-muted/40" />
                    <div className="h-3 w-20 rounded-sm bg-muted/60" />
                  </div>

                  {/* Title Skeleton Lines */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4.5 w-full rounded-sm bg-muted/80" />
                    <div className="h-4.5 w-3/4 rounded-sm bg-muted/70" />
                  </div>

                  {/* Excerpt Skeleton Lines */}
                  <div className="space-y-1.5 mb-2">
                    <div className="h-3 w-full rounded-sm bg-muted/50" />
                    <div className="h-3 w-5/6 rounded-sm bg-muted/50" />
                    <div className="h-3 w-2/3 rounded-sm bg-muted/40" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const { initialBlogs, initialTotal, initialHasMore, categories } = await getInitialHomeData();

  return (
    <>
      <TradingBackground />
      <div suppressHydrationWarning className="w-full min-h-screen flex flex-col items-center pt-10 sm:pt-18 pb-20 sm:pb-28">
        {/* Hero Header with generous vertical spacing */}
        <header className="max-w-3xl mx-auto text-center px-4 pb-8 sm:pb-12">
          <FadeIn direction="up" distance={12} duration={0.45} delay={0.06}>
            {/* Pill Badge above Title */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs sm:text-sm font-medium text-foreground mb-4 sm:mb-5 shadow-xs">
              <span>Learn</span>
              <span className="text-primary font-bold">·</span>
              <span>Adapt</span>
              <span className="text-primary font-bold">·</span>
              <span>Execute</span>
            </div>
          </FadeIn>

          <FadeIn direction="up" distance={18} duration={0.52} delay={0.14}>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Traders Community
            </h1>
          </FadeIn>

          <FadeIn direction="up" distance={14} duration={0.52} delay={0.24}>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground font-normal">
              Enhancing market understanding through data-driven research and education.
            </p>
          </FadeIn>
        </header>

        {/* Interactive Blog Section */}
        <BlogSection
          initialBlogs={initialBlogs}
          initialTotal={initialTotal}
          initialHasMore={initialHasMore}
          categories={categories}
        />
      </div>
    </>
  );
}