import React from "react";

export function BlogCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-full rounded-2xl border border-border/60 bg-card/60 overflow-hidden flex flex-col animate-pulse"
    >
      {/* Thumbnail skeleton */}
      <div className="aspect-video w-full bg-muted/70" />

      {/* Body skeleton */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Meta row */}
          <div className="flex gap-3">
            <div className="h-3 w-20 bg-muted/80 rounded" />
            <div className="h-3 w-16 bg-muted/80 rounded" />
          </div>

          {/* Title */}
          <div className="h-5 w-5/6 bg-muted rounded" />
          <div className="h-5 w-3/4 bg-muted rounded" />

          {/* Excerpt */}
          <div className="space-y-1.5 pt-2">
            <div className="h-3 w-full bg-muted/70 rounded" />
            <div className="h-3 w-4/5 bg-muted/70 rounded" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-border/40 flex justify-between items-center">
          <div className="h-3 w-24 bg-muted/80 rounded" />
          <div className="h-4 w-4 bg-muted/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default BlogCardSkeleton;
