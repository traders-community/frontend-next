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
    : `${siteConfig.name} | ${siteConfig.tagline}`;

  const cleanSiteUrl = siteConfig.url.replace(/\/+$/, "");
  const cleanCanonical = canonicalUrl
    ? canonicalUrl.startsWith("/")
      ? canonicalUrl
      : `/${canonicalUrl}`
    : "";
  const resolvedUrl = canonicalUrl ? `${cleanSiteUrl}${cleanCanonical}` : cleanSiteUrl;

  const rawImage = image || siteConfig.ogImage;
  const isLocalOrInvalid =
    !rawImage ||
    rawImage.startsWith("http://localhost") ||
    rawImage.startsWith("data:") ||
    rawImage.trim() === "";

  const finalImage = isLocalOrInvalid ? siteConfig.ogImage : rawImage;

  let resolvedImage = finalImage.startsWith("http")
    ? finalImage
    : `${cleanSiteUrl}/${finalImage.replace(/^\/+/, "")}`;

  // WhatsApp and iOS scrapers strictly require standard JPEG or PNG under 300KB
  // For ImageKit URLs: automatically apply transformation for 1200x630 progressive JPEG at ~75KB
  if (resolvedImage.includes("ik.imagekit.io")) {
    if (resolvedImage.includes("/tr:")) {
      resolvedImage = resolvedImage.replace(/\/tr:[^/]+/, "/tr:w-1200,h-630,fo-auto,q-75,f-jpg");
    } else {
      const match = resolvedImage.match(/(https:\/\/ik\.imagekit\.io\/[^/]+)\/(.+)/);
      if (match) {
        resolvedImage = `${match[1]}/tr:w-1200,h-630,fo-auto,q-75,f-jpg/${match[2]}`;
      }
    }
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
      icon: [
        { url: "/icon.png?v=2" },
        { url: "/icon.png?v=2", sizes: "32x32", type: "image/png" },
        { url: "/icon.png?v=2", sizes: "192x192", type: "image/png" },
      ],
      shortcut: "/icon.png?v=2",
      apple: "/icon.png?v=2",
    },
  };
}
