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

// Dynamic server rendering ensures fresh filtering on query parameters and prevents build-time prerender failures
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<{ category?: string; q?: string }>;
}

async function getInitialHomeData(filters?: { category?: string; search?: string }) {
  try {
    const categoryParam =
      filters?.category && filters.category.trim().toLowerCase() !== "all"
        ? filters.category.trim()
        : undefined;

    const [blogsRes, categoriesRes] = await Promise.all([
      blogService.getBlogs({
        page: 1,
        limit: 9,
        category: categoryParam,
        search: filters?.search?.trim() || undefined,
        revalidate: 0,
      }),
      categoryService.getPublicCategories(60),
    ]);

    const initialBlogs = blogsRes?.data?.blogs || [];
    const initialTotal = blogsRes?.data?.total || initialBlogs.length;
    const initialHasMore = Boolean(blogsRes?.data?.hasMore);

    const rawCats = categoriesRes?.data?.categories;
    const categoryNames = [
      "All",
      ...(Array.isArray(rawCats) ? rawCats : [])
        .filter((c) => c && c.isActive !== false && c.name)
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

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const rawCat = (resolvedParams as Record<string, string | string[] | undefined>)?.category;
  const currentCategory = (Array.isArray(rawCat) ? rawCat[0] : rawCat) || "All";
  const rawQ = (resolvedParams as Record<string, string | string[] | undefined>)?.q;
  const currentSearch = (Array.isArray(rawQ) ? rawQ[0] : rawQ) || "";

  const { initialBlogs, initialTotal, initialHasMore, categories } = await getInitialHomeData({
    category: currentCategory,
    search: currentSearch,
  });

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

        {/* Interactive Blog Section wrapped with Suspense */}
        <Suspense fallback={null}>
          <BlogSection
            initialBlogs={initialBlogs}
            initialTotal={initialTotal}
            initialHasMore={initialHasMore}
            categories={categories}
            initialCategory={currentCategory}
            initialSearch={currentSearch}
          />
        </Suspense>
      </div>
    </>
  );
}