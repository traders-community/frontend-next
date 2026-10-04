import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import { productService } from "@/services/product.service";
import { CourseCard } from "@/components/course/course-card";
import {
  RiGraduationCapLine,
  RiBookOpenLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiCompass3Line,
} from "@remixicon/react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

// Enable ISR Caching on Edge with 60-second background revalidation
export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Community Courses",
  description:
    "Explore verified community trading courses and mentorship programs with Traders Community.",
  canonicalUrl: "/courses",
});

export default async function CoursesPage() {
  const productsRes = await productService.getPublicProducts().catch(() => null);
  const products = productsRes?.data?.products || [];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-6 sm:py-10">
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
        {/* ---------------- Compact Rich Header ---------------- */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 pt-1 sm:pt-2">

          {/* Pill Badge above Title */}
          <FadeIn direction="up" distance={12} duration={0.45} delay={0.06}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs sm:text-sm font-medium text-foreground mb-4 sm:mb-5 shadow-xs">
              <span>Learn</span>
              <span className="text-primary font-bold">·</span>
              <span>Adapt</span>
              <span className="text-primary font-bold">·</span>
              <span>Execute</span>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn direction="up" distance={18} duration={0.52} delay={0.14}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Master the Markets with Community Courses
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn direction="up" distance={14} duration={0.52} delay={0.24}>
            <p className="mt-2.5 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Practical, structured curriculum and real-world trading mentorship designed to help you navigate derivatives, risk management, and market analysis with confidence.
            </p>
          </FadeIn>

        </div>

        {/* ---------------- 2-Column Full-Width Product Cards ---------------- */}
        {products.length > 0 ? (
          <StaggerContainer staggerDelay={0.12} delayChildren={0.3} className="flex flex-col gap-6 sm:gap-8">
            {products.map((product, index) => (
              <StaggerItem key={product._id || product.id || index}>
                <CourseCard
                  product={product}
                  priority={index === 0}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          /* Empty State */
          <FadeIn direction="up" distance={20} duration={0.48} delay={0.3}>
            <div className="p-10 sm:p-16 rounded-3xl border border-border/80 bg-card text-center flex flex-col items-center max-w-xl mx-auto shadow-xs my-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
                <RiGraduationCapLine className="h-7 w-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                New Courses Are In Preparation
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Our mentors are finalizing upcoming batches. Check back soon or browse our free market research blogs.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-full bg-primary text-black hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <RiBookOpenLine className="h-4 w-4 mr-1.5" />
                  <span>Read Blogs</span>
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
