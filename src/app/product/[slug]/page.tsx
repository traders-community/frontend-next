import React, { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { productService } from "@/services/product.service";
import { blogService } from "@/services/blog.service";
import { productReviewService } from "@/services/product-review.service";
import { constructMetadata } from "@/lib/seo/metadata";
import { ProductView } from "@/components/product/product-view";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Enable ISR Caching on Edge with 60-second background revalidation
export const revalidate = 60;

/**
 * Deduplicated Product Fetcher (memoized per-request lifecycle via React cache)
 */
const getCachedProduct = cache(async (slug: string) => {
  return productService.getProductBySlugOrId(slug);
});

/**
 * Generate dynamic SEO metadata for the product page
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCachedProduct(slug);
  const product = res.data?.product;

  if (!product || !product.isActive) {
    return constructMetadata({
      title: "Product Not Found",
      description: "The product you requested was not found or is unavailable.",
      noIndex: true,
    });
  }

  const minPrice =
    product.variations && product.variations.length > 0
      ? Math.min(...product.variations.map((v) => v.sellingPrice))
      : 0;

  const plainShortDescription = product.shortDescription
    ? product.shortDescription.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim()
    : "";

  return constructMetadata({
    title: `${product.title} | Traders Community`,
    description:
      plainShortDescription ||
      `Join ${product.title}. Starting at ₹${minPrice.toLocaleString("en-IN")}. Verified trading track.`,
    canonicalUrl: `/product/${product.slug || product._id}`,
    image: product.featuredImage,
    type: "website",
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product, 4 latest blogs, and initial reviews in parallel
  const productRes = await getCachedProduct(slug);
  const product = productRes.data?.product;

  if (!product || !product.isActive) {
    notFound();
  }

  const [blogsRes, reviewsRes] = await Promise.all([
    blogService.getBlogs({ page: 1, limit: 4 }).catch(() => null),
    productReviewService
      .getProductReviews(product._id || product.id || "", { page: 1, limit: 5 })
      .catch(() => null),
  ]);

  const latestBlogs = blogsRes?.data?.blogs || [];
  const initialReviews = reviewsRes?.data?.reviews || [];
  const initialReviewStats = reviewsRes?.data?.stats;
  const initialTotalReviews =
    reviewsRes?.data?.total ?? reviewsRes?.data?.stats?.totalReviews ?? initialReviews.length;

  // Rich JSON-LD Product Schema for SEO
  const plainProductDesc = product.shortDescription
    ? product.shortDescription.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim()
    : product.title;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.featuredImage,
    description: plainProductDesc,
    sku: product.variations?.[0]?.sku || "TC-PROD",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: product.startingPrice || product.variations?.[0]?.sellingPrice || 0,
      highPrice:
        product.variations && product.variations.length > 0
          ? Math.max(...product.variations.map((v) => v.sellingPrice))
          : 0,
      offerCount: product.variations?.length || 1,
      availability: "https://schema.org/InStock",
    },
    ...(initialReviewStats && initialReviewStats.totalReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: initialReviewStats.averageRating,
            reviewCount: initialReviewStats.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductView
        product={product}
        latestBlogs={latestBlogs}
        initialReviews={initialReviews}
        initialReviewStats={initialReviewStats}
        initialTotalReviews={initialTotalReviews}
      />
    </>
  );
}
