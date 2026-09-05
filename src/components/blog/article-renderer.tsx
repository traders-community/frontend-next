import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface ArticleRendererProps {
  html: string;
  className?: string;
}

/**
 * Ensures any <table> element is wrapped in a responsive .table-wrapper container
 * so it stretches 100% of available width while maintaining horizontal scrollability on mobile.
 */
function wrapTables(html = ""): string {
  if (!html || !/<table\b/i.test(html)) return html;

  return html.replace(
    /(<div[^>]*class="[^"]*table-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>)|(<table[\s\S]*?<\/table>)/gi,
    (match, alreadyWrapped, bareTable) => {
      if (alreadyWrapped) return alreadyWrapped;
      return `<div class="table-wrapper">${bareTable}</div>`;
    }
  );
}

/**
 * Shared ArticleRenderer Component
 * Single source of truth for article HTML rendering across both the
 * public published blog page (/blog/[slug]) and the admin Live Preview.
 */
export function ArticleRenderer({ html, className }: ArticleRendererProps) {
  const processedHtml = useMemo(() => wrapTables(html), [html]);

  return (
    <article
      className={cn("rich-text w-full", className)}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

export default ArticleRenderer;
