import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface ArticleRendererProps {
  html: string;
  className?: string;
}

/**
 * Ensures any <table> element is wrapped in a responsive .table-wrapper container
 * allowing smooth horizontal scrolling on mobile while preventing viewport overflow.
 */
function wrapTables(html = ""): string {
  if (!html || !/<table\b/i.test(html)) return html;

  // 1. Repair any malformed tag from earlier runs (e.g. `< class="table-wrapper">`)
  let clean = html.replace(/<\s*class="[^"]*table-wrapper[^"]*">/gi, '<div class="table-wrapper">');
  // Remove any legacy inline swipe hint markup
  clean = clean.replace(/<div class="table-scroll-hint[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");

  // 2. Wrap only bare unwrapped <table> elements
  return clean.replace(
    /(<div[^>]*class="[^"]*table-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>)|(<table[\s\S]*?<\/table>)/gi,
    (match, alreadyWrapped, bareTable) => {
      if (alreadyWrapped) return alreadyWrapped;
      return `<div class="table-wrapper">${bareTable}</div>`;
    }
  );
}

/**
 * Normalizes empty Quill paragraphs (<p><br></p>) so authors pressing Enter multiple times
 * get natural, consistent spacing rather than huge vertical voids.
 */
function normalizeSpacing(html = ""): string {
  if (!html) return "";
  // Collapse 2 or more consecutive empty paragraphs (<p><br></p>, <p>&nbsp;</p>, etc.) into a single one
  return html.replace(/(<p>\s*(?:<br\s*\/?>|&nbsp;|\s*)\s*<\/p>\s*){2,}/gi, "<p><br></p>");
}

/**
 * Shared ArticleRenderer Component
 * Single source of truth for article HTML rendering across both the
 * public published blog page (/blog/[slug]) and the admin Live Preview.
 */
export function ArticleRenderer({ html, className }: ArticleRendererProps) {
  const processedHtml = useMemo(() => {
    if (!html) return "";
    const cleanHtml = normalizeSpacing(html);
    return wrapTables(cleanHtml);
  }, [html]);

  return (
    <article
      className={cn("rich-text w-full", className)}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

export default ArticleRenderer;
