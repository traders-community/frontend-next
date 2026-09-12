import { Suspense } from "react";
import { BlogSection, BlogSectionSkeleton } from "@/components/blog/blog-section";
import { TradingBackground } from "@/components/common/trading-background";
import { FadeIn } from "@/components/motion";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  canonicalUrl: "/",
  image: "/featured_img.jpg",
});

export default function Home() {
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
        <Suspense fallback={<BlogSectionSkeleton />}>
          <BlogSection />
        </Suspense>
      </div>
    </>
  );
}