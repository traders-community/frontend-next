"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import {
  RiStarFill,
  RiStarLine,
  RiCheckboxCircleFill,
  RiFlashlightLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiZoomInLine,
  RiBookOpenLine,
  RiChat1Line,
} from "@remixicon/react";
import { Product, ProductVariation, Blog, ProductReview, ProductReviewStats } from "@/types";
import { Button } from "@/components/ui/button";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { BlogCard } from "@/components/blog/blog-card";
import { ProductReviewsSection } from "./product-reviews-section";
import { ProductQuickCheckoutModal } from "./product-quick-checkout-modal";
import { ProductStickyBar } from "./product-sticky-bar";
import { cn } from "@/lib/utils";

interface ProductViewProps {
  product: Product;
  latestBlogs?: Blog[];
  initialReviews?: ProductReview[];
  initialReviewStats?: ProductReviewStats;
  initialTotalReviews?: number;
}

export function ProductView({
  product,
  latestBlogs = [],
  initialReviews = [],
  initialReviewStats,
  initialTotalReviews,
}: ProductViewProps) {
  // Variations
  const activeVariations =
    product.variations && product.variations.length > 0
      ? product.variations.filter((v) => v.isActive !== false)
      : [];

  const defaultVariation =
    activeVariations.find((v) => v.isDefault) ||
    activeVariations[0] ||
    ({
      _id: "default",
      title: "Standard Plan",
      durationValue: 1,
      durationUnit: "months",
      actualPrice: 0,
      sellingPrice: product.startingPrice || 0,
      sku: "TC-PROD",
      isDefault: true,
      isActive: true,
    } as ProductVariation);

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation>(defaultVariation);

  // Short description & highlights expand/collapse state
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick Checkout Modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Tab State: "overview" | "reviews"
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  // Calculate discount percentage
  const discountPercent =
    selectedVariation.actualPrice > selectedVariation.sellingPrice
      ? Math.round(
          ((selectedVariation.actualPrice - selectedVariation.sellingPrice) /
            selectedVariation.actualPrice) *
            100
        )
      : 0;

  // Rating and review calculations
  const reviewCount =
    initialReviewStats?.totalReviews ?? product.reviewCount ?? 0;
  const hasReviews =
    reviewCount > 0 &&
    Boolean(initialReviewStats?.averageRating || product.averageRating);
  const avgRating = hasReviews
    ? initialReviewStats?.averageRating || product.averageRating || 0
    : 0;

  const handleRatingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab("reviews");
    setTimeout(() => {
      const el = document.getElementById("product-tabs");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="w-full min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* ========================================================= */}
        {/* SECTION 1: 2-COLUMN PRODUCT HERO LAYOUT                    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* ---------------- LEFT COLUMN: Sticky Image Container ---------------- */}
          <div className="w-full lg:sticky lg:top-24 lg:self-start">
            {/* Product Image Container with Lightbox & 1:1 Square Aspect Ratio */}
            <PhotoProvider>
              <div className="group relative w-full aspect-square rounded-3xl overflow-hidden border border-border/80 bg-card shadow-xl shadow-black/5 dark:shadow-black/25">
                <PhotoView src={product.featuredImage}>
                  <div className="relative w-full h-full cursor-zoom-in">
                    <Image
                      src={product.featuredImage}
                      alt={product.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Zoom Hint Badge */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-md text-xs font-medium border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <RiZoomInLine className="h-3.5 w-3.5" />
                      <span>Click to expand</span>
                    </div>

                    {/* Discount Badge Overlay */}
                    {discountPercent > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-primary text-black shadow-md shadow-primary/30">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </PhotoView>
              </div>
            </PhotoProvider>
          </div>

          {/* ---------------- RIGHT COLUMN: Product Details & Purchase ---------------- */}
          <div className="flex flex-col space-y-5">
            {/* Top Row: Breadcrumb Navigation */}
            <div>
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap"
              >
                <Link
                  href="/"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Home
                </Link>
                <RiArrowRightSLine className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <Link
                  href="/explore"
                  className="hover:text-primary transition-colors"
                >
                  Store
                </Link>
                <RiArrowRightSLine className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                  {product.title}
                </span>
              </nav>
            </div>

            {/* Main Product Title (Single H1) */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-[1.15] font-heading">
              {product.title}
            </h1>

            {/* Rating Stars & Count (Clickable to switch tab to reviews) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRatingClick}
                className="group inline-flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-left"
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) =>
                    hasReviews && star <= Math.round(avgRating) ? (
                      <RiStarFill
                        key={star}
                        className="h-4 w-4 text-amber-400 fill-amber-400"
                      />
                    ) : (
                      <RiStarLine
                        key={star}
                        className="h-4 w-4 text-muted-foreground/35"
                      />
                    )
                  )}
                </div>

                {hasReviews ? (
                  <>
                    <span className="text-sm font-bold text-foreground">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors underline-offset-2 hover:underline">
                      ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors underline-offset-2 hover:underline font-medium">
                    No reviews yet
                  </span>
                )}
              </button>
            </div>

            {/* Price Section: Prices on line 1, Save amount on line 2 (Mobile friendly) */}
            <div className="space-y-1.5 py-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-heading">
                  ₹{selectedVariation.sellingPrice.toLocaleString("en-IN")}
                </span>
                {selectedVariation.actualPrice > selectedVariation.sellingPrice && (
                  <span className="text-lg sm:text-xl font-medium text-muted-foreground line-through">
                    ₹{selectedVariation.actualPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Save ₹{(selectedVariation.actualPrice - selectedVariation.sellingPrice).toLocaleString("en-IN")} ({discountPercent}% OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Filter Tags: Larger comfortable touch buttons for mobile */}
            {activeVariations.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Plan Duration:
                </label>
                <div className="flex flex-wrap gap-2.5 sm:gap-2">
                  {activeVariations.map((v) => {
                    const isSelected =
                      (v._id && v._id === selectedVariation._id) ||
                      (v.id && v.id === selectedVariation.id) ||
                      v.sku === selectedVariation.sku;

                    return (
                      <button
                        key={v._id || v.id || v.sku}
                        type="button"
                        onClick={() => setSelectedVariation(v)}
                        className={cn(
                          "relative px-4 py-2.5 sm:px-3.5 sm:py-2 rounded-xl text-sm sm:text-xs font-semibold transition-all duration-150 border cursor-pointer select-none",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40 font-bold"
                            : "border-border/80 bg-card hover:bg-surface hover:border-primary/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span>{v.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Buy / Subscribe Primary Action Button (Regular Size, Simple Text) */}
            <div id="main-buy-button" className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setCheckoutModalOpen(true)}
                className="text-sm font-bold text-black gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer h-10 px-6 rounded-xl"
              >
                <RiFlashlightLine className="h-4 w-4" />
                <span>Subscribe Now</span>
              </Button>
            </div>

            {/* Short Description & Highlights (16px text across mobile and large screens) */}
            {(product.shortDescription || (product.points && product.points.length > 0)) && (
              <div className="space-y-3 pt-2">
                <div
                  className={cn(
                    "relative transition-all duration-300",
                    !isExpanded && "max-h-[150px] overflow-hidden"
                  )}
                >
                  {/* Short description HTML renderer: 16px (text-base) across all screens */}
                  {product.shortDescription && (
                    <div className="mb-3">
                      <ArticleRenderer
                        html={product.shortDescription}
                        className="text-base text-foreground/85 leading-relaxed [&>p]:text-base [&>p]:text-foreground/85 [&>p]:leading-relaxed [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
                      />
                    </div>
                  )}

                  {/* Highlights List: 16px (text-base) across all screens */}
                  {product.points && product.points.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Key Highlights:
                      </span>
                      <ul className="space-y-2 text-base">
                        {product.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <RiCheckboxCircleFill className="h-4.5 w-4.5 shrink-0 text-primary mt-0.5" />
                            <span className="text-foreground/90">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom transparent gradient overlay when collapsed */}
                  {!isExpanded && (
                    <div className="pointer-events-none absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
                  )}
                </div>

                {/* Read More / Read Less Toggle Button */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer select-none py-1 px-2.5 rounded-lg hover:bg-primary/10"
                  >
                    <span>{isExpanded ? "Read Less" : "Read More & Highlights"}</span>
                    {isExpanded ? (
                      <RiArrowUpSLine className="h-4 w-4" />
                    ) : (
                      <RiArrowDownSLine className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: TABS SECTION (OVERVIEW & DETAILS / REVIEWS)     */}
        {/* ========================================================= */}
        <section id="product-tabs" className="w-full scroll-mt-24 space-y-6 pt-4 border-t border-border/80">
          {/* Tab Navigation Bar: Original Clean Style */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-3 flex-wrap">
            {/* Tab 1: Overview & Details */}
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer select-none",
                activeTab === "overview"
                  ? "bg-primary text-black shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              <RiBookOpenLine className="h-4 w-4" />
              <span>Overview & Details</span>
            </button>

            {/* Tab 2: Reviews */}
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer select-none",
                activeTab === "reviews"
                  ? "bg-primary text-black shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              <RiChat1Line className="h-4 w-4" />
              <span>Reviews</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-mono font-semibold",
                  activeTab === "reviews"
                    ? "bg-black/20 text-black"
                    : "bg-surface border border-border text-muted-foreground"
                )}
              >
                {reviewCount}
              </span>
            </button>
          </div>

          {/* Tab 1 Content: Overview & Long Description (In card block container, no read-more) */}
          {activeTab === "overview" && (
            <div className="pt-2">
              {product.longDescription ? (
                <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-sm">
                  <ArticleRenderer html={product.longDescription} />
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card shadow-sm">
                  {product.shortDescription ? (
                    <ArticleRenderer html={product.shortDescription} />
                  ) : (
                    <p className="text-base text-muted-foreground leading-relaxed">
                      No additional detailed overview provided for this product.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2 Content: Customer Reviews */}
          {activeTab === "reviews" && (
            <ProductReviewsSection
              productId={product._id || product.id || ""}
              productTitle={product.title}
              initialReviews={initialReviews}
              initialStats={initialReviewStats}
              initialTotal={initialTotalReviews ?? initialReviewStats?.totalReviews}
            />
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: BLOGS GRID (4 LATEST BLOGS)                     */}
        {/* ========================================================= */}
        {latestBlogs.length > 0 && (
          <section className="w-full space-y-8 pt-6 border-t border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                  Latest From Our Blog
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Explore trading strategies, macro breakdowns, and technical tutorials.
                </p>
              </div>

              {/* Header Action Button */}
              <Button
                variant="outline"
                size="md"
                href="/"
                className="gap-2 self-start sm:self-auto cursor-pointer"
              >
                <span>Explore All Articles</span>
                <RiArrowRightLine className="h-4 w-4" />
              </Button>
            </div>

            {/* 4-Item Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestBlogs.slice(0, 4).map((blog) => (
                <BlogCard key={blog._id || blog.slug} blog={blog} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: MINIMAL FLOATING STICKY BAR FOR QUICK CHECKOUT */}
      {/* ========================================================= */}
      <ProductStickyBar
        product={product}
        selectedVariation={selectedVariation}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
        triggerElementId="main-buy-button"
      />

      {/* ========================================================= */}
      {/* QUICK CHECKOUT MODAL                                      */}
      {/* ========================================================= */}
      <ProductQuickCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        product={product}
        selectedVariation={selectedVariation}
      />
    </div>
  );
}

export default ProductView;
