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

  const resolvedImage = image.startsWith("http") ? image : `${siteConfig.url}${image.startsWith("/") ? image : `/${image}`}`;

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
          width: 1200,
          height: 630,
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
