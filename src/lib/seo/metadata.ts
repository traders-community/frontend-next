import type { Metadata } from "next";
import { siteConfig } from "@/config/seo.config";
import type { ConstructMetadataParams } from "@/types";

/**
 * Builds standard, type-safe Next.js Metadata for any page (static or SSR dynamic).
 */
export function constructMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  canonicalUrl,
  noIndex = false,
  keywords = siteConfig.keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  authors = [siteConfig.author],
}: ConstructMetadataParams = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;

  const resolvedUrl = canonicalUrl
    ? `${siteConfig.url}${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`
    : siteConfig.url;

  const rawImage = image || siteConfig.ogImage;
  const isLocalOrInvalid =
    !rawImage ||
    rawImage.startsWith("http://localhost") ||
    rawImage.startsWith("data:") ||
    rawImage.trim() === "";

  const finalImage = isLocalOrInvalid ? siteConfig.ogImage : rawImage;

  let resolvedImage = finalImage.startsWith("http")
    ? finalImage
    : `${siteConfig.url}${finalImage.startsWith("/") ? finalImage : `/${finalImage}`}`;

  // WhatsApp and some mobile crawlers prefer JPG/PNG over WebP; if using ImageKit, ensure JPEG delivery
  if (resolvedImage.includes("ik.imagekit.io") && resolvedImage.includes("f-webp")) {
    resolvedImage = resolvedImage.replace("f-webp", "f-jpg");
  }

  return {
    title: pageTitle,
    description,
    keywords,
    authors: authors.map((name) => ({ name })),
    creator: siteConfig.author,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: resolvedUrl,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: resolvedUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: resolvedImage,
          secureUrl: resolvedImage,
          width: 1200,
          height: 630,
          type: resolvedImage.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
          alt: pageTitle,
        },
      ],
      ...(type === "article" && publishedTime
        ? {
            publishedTime,
            modifiedTime: modifiedTime || publishedTime,
            authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [resolvedImage],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
  };
}
