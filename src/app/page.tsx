import { Suspense } from "react";
import { BlogSection, BlogSectionSkeleton } from "@/components/blog/blog-section";
import { TradingBackground } from "@/components/common/trading-background";
import { FadeIn } from "@/components/motion";
import { constructMetadata } from "@/lib/seo/metadata";
import { CACHE_TAGS } from "@/lib/api/cache-tags";
import { blogService, categoryService } from "@/services";
import { Blog } from "@/types";

export const metadata = constructMetadata({
  canonicalUrl: "/",
  image: "/featured_img.jpg",
});

// Soft navigation must never reuse a cached home payload (admin publish/unpublish)
export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

interface HomeProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

interface HomeFeedData {
  blogs?: Blog[];
  total: number;
  hasMore: boolean;
  categories?: string[];
}

const firstValue = (value?: string) => (typeof value === "string" ? value.trim() : "");

/**
 * Always hits the API (no Data Cache). Soft-nav Home → About → Home must show the
 * latest publish state without a hard reload. Categories stay tagged so admin
 * mutations can still purge them via /api/revalidate when configured.
 */
async function getHomeFeed(category: string, search: string): Promise<HomeFeedData> {
  const [blogsRes, categoriesRes] = await Promise.all([
    blogService.getBlogs({
      page: 1,
      limit: PAGE_SIZE,
      category: category || undefined,
      search: search || undefined,
      revalidate: 0,
      tags: [CACHE_TAGS.blogs],
    }),
    categoryService.getPublicCategories(0),
  ]);

  const categories = categoriesRes.data?.success
    ? [
        "All",
        ...categoriesRes.data.categories
          .filter((c) => c && c.isActive !== false && c.name)
          .map((c) => c.name),
      ]
    : undefined;

  if (!blogsRes.data?.success) {
    return { blogs: undefined, total: 0, hasMore: false, categories };
  }

  return {
    blogs: blogsRes.data.blogs || [],
    total: blogsRes.data.total ?? 0,
    hasMore: Boolean(blogsRes.data.hasMore),
    categories: categories ? Array.from(new Set(categories)) : undefined,
  };
}

async function HomeFeed({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = firstValue(params.category);
  const search = firstValue(params.q);
  const feed = await getHomeFeed(category.toLowerCase() === "all" ? "" : category, search);

  return (
    <BlogSection
      initialBlogs={feed.blogs}
      initialTotal={feed.total}
      initialHasMore={feed.hasMore}
      categories={feed.categories}
      initialCategory={category || "All"}
      initialSearch={search}
    />
  );
}

export default async function Home({ searchParams }: HomeProps) {
  // Awaiting searchParams marks the route dynamic so the client router never
  // reuses a previous RSC payload when navigating back to "/".
  await searchParams;

  return (
    <>
      <TradingBackground />
      <div suppressHydrationWarning className="w-full min-h-screen flex flex-col items-center pt-10 sm:pt-18 pb-20 sm:pb-28">
        <header className="max-w-3xl mx-auto text-center px-4 pb-8 sm:pb-12">
          <FadeIn direction="up" distance={12} duration={0.45} delay={0.06}>
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

        <Suspense fallback={<BlogSectionSkeleton />}>
          <HomeFeed searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
