import React from "react";
import { siteConfig } from "@/config/seo.config";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization Schema (Google Knowledge Graph)
 */
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    email: siteConfig.email,
    sameAs: [
      siteConfig.socialLinks.instagram,
      siteConfig.socialLinks.telegram,
      siteConfig.socialLinks.whatsapp,
    ],
  };

  return <JsonLd data={schema} />;
}

/**
 * WebSite Schema with Sitelinks Searchbox
 */
export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={schema} />;
}

/**
 * Article / BlogPosting Schema for individual blog articles (SSR-ready)
 */
export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = siteConfig.author,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  const resolvedImage = image?.startsWith("http")
    ? image
    : `${siteConfig.url}${image?.startsWith("/") ? image : `/${image}`}`;

  const resolvedUrl = url?.startsWith("http")
    ? url
    : `${siteConfig.url}${url?.startsWith("/") ? url : `/${url}`}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: [resolvedImage],
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": resolvedUrl,
    },
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };

  return <JsonLd data={schema} />;
}

/**
 * Breadcrumbs Schema
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${siteConfig.url}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };

  return <JsonLd data={schema} />;
}
