import { Suspense } from "react";
import { BlogSection } from "@/components/blog/blog-section";
import { TradingBackground } from "@/components/common/trading-background";
import { blogService, categoryService } from "@/services";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  canonicalUrl: "/",
  image: "/featured_img.jpg",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getInitialHomeData() {
  try {
    const [blogsRes, categoriesRes] = await Promise.all([
      blogService.getBlogs({ page: 1, limit: 9, revalidate: 0 }),
      categoryService.getPublicCategories(0),
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

function BlogSectionLoadingFallback() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-28">
      <div className="w-9 h-9 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <span className="mt-4 text-sm text-muted-foreground font-medium">Loading articles...</span>
    </div>
  );
}

export default async function Home() {
  const { initialBlogs, initialTotal, initialHasMore, categories } = await getInitialHomeData();

  return (
    <>
      <TradingBackground />
      <div className="w-full min-h-screen flex flex-col items-center pt-10 sm:pt-18 pb-20 sm:pb-28">
      {/* Hero Header with generous vertical spacing */}
      <header className="max-w-2xl mx-auto text-center px-4 pb-10 sm:pb-14">
        <h1 className="text-3xl sm:text-5xl font-bold">
          Traders Community
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground font-medium tracking-wide">
          Learn<span className="text-primary mx-2 font-bold">·</span>Adapt<span className="text-primary mx-2 font-bold">·</span>Execute
        </p>
      </header>

      {/* Interactive Blog Section (Search, Category Tabs, Grid & Load More) */}
      <Suspense fallback={<BlogSectionLoadingFallback />}>
        <BlogSection
          initialBlogs={initialBlogs}
          initialTotal={initialTotal}
          initialHasMore={initialHasMore}
          categories={categories}
        />
      </Suspense>
    </div>
    </>
  );
}