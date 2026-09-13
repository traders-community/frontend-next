"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { RiUserLine, RiSendPlaneLine, RiLoader4Line } from "@remixicon/react";
import { Comment } from "@/types";
import { blogService } from "@/services";
import { formatDate } from "@/lib/utils";

interface BlogCommentsProps {
  blogId: string;
  initialComments?: Comment[];
  initialTotal?: number;
  initialHasMore?: boolean;
  isDraftPreview?: boolean;
}

const COMMENTS_PER_PAGE = 10;

export function BlogComments({
  blogId,
  initialComments = [],
  initialTotal,
  initialHasMore,
  isDraftPreview = false,
}: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [totalComments, setTotalComments] = useState<number>(
    initialTotal ?? initialComments.length
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>(
    initialHasMore ?? (initialTotal ? initialComments.length < initialTotal : false)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sentinel ref for infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch next page of comments
  const loadMoreComments = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await blogService.getBlogComments(blogId, {
        page: nextPage,
        limit: COMMENTS_PER_PAGE,
      });

      if (res.data?.success && res.data.comments) {
        const newComments = res.data.comments;
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const uniqueNew = newComments.filter((c) => !existingIds.has(c._id));
          return [...prev, ...uniqueNew];
        });

        setPage(nextPage);
        if (typeof res.data.total === "number") {
          setTotalComments(res.data.total);
        }
        setHasMore(Boolean(res.data.hasMore));
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more comments:", err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [blogId, page, hasMore, isLoadingMore]);

  // Set up IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isDraftPreview) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreComments();
        }
      },
      {
        root: null,
        rootMargin: "250px", // Trigger slightly before user scrolls to the bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreComments, hasMore, isLoadingMore, isDraftPreview]);

  // Refresh first page on new comment submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDraftPreview) {
      toast.info("Commenting is disabled while the article is unpublished.");
      return;
    }
    if (!name.trim() || !content.trim()) {
      toast.error("Please enter both your name and comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await blogService.addComment(blogId, name.trim(), content.trim());
      if (res.data?.success) {
        toast.success(res.data.message || "Comment submitted for review!");
        setName("");
        setContent("");
      } else {
        toast.error(res.data?.message || "Failed to submit comment.");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-label="Article comments" className="w-full mt-14 pt-8 border-t border-border/60">
      {/* Header */}
      <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
        <span className="text-primary">Comments</span>
        <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
          {totalComments}
        </span>
      </h3>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-4 mb-8 w-full">
          {comments.map((comment) => (
            <article
              key={comment._id}
              className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                    <RiUserLine className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-primary">
                    {comment.name}
                  </span>
                </div>

                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(comment.createdAt)}
                </time>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed pl-9 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </article>
          ))}

          {/* Loading Skeleton / Spinner for Infinite Scroll */}
          {isLoadingMore && (
            <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card/40 flex items-center justify-center gap-2.5 py-6">
              <RiLoader4Line className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs font-medium text-muted-foreground">
                Loading more comments...
              </span>
            </div>
          )}

          {/* Infinite Scroll Bottom Sentinel */}
          {hasMore && !isLoadingMore && (
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center">
              <button
                type="button"
                onClick={loadMoreComments}
                className="text-xs font-semibold text-primary hover:underline py-2 cursor-pointer"
              >
                Load more comments
              </button>
            </div>
          )}

          {/* End of Comments Indicator */}
          {!hasMore && comments.length >= 10 && (
            <p className="text-xs text-center text-muted-foreground/80 py-2">
              You&apos;ve reached the end of comments.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-8">
          {isDraftPreview
            ? "No comments yet. Public comments will appear here once the post is published."
            : "No comments yet. Be the first to share your perspective!"}
        </p>
      )}

      {/* Add Comment Form or Draft Notice */}
      {isDraftPreview ? (
        <div className="w-full p-5 rounded-2xl border border-border/70 bg-surface/60 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Commenting is disabled while this article is unpublished.
          </p>
          <p className="text-xs text-muted-foreground/75 mt-1">
            Publish this article to allow readers to join the discussion.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <h4 className="text-base font-semibold mb-4 text-foreground">
            Leave a Comment
          </h4>

          <form onSubmit={handleAddComment} className="flex flex-col gap-4">
            <div>
              <label htmlFor="comment-name" className="sr-only">
                Your Name
              </label>
              <input
                id="comment-name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full h-11 px-4 rounded-xl border border-border/80 bg-card/70 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="comment-content" className="sr-only">
                Your Comment
              </label>
              <textarea
                id="comment-content"
                placeholder="Write your constructive thoughts or question…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                disabled={isSubmitting}
                className="w-full p-4 rounded-xl border border-border/80 bg-card/70 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 px-6 rounded-full bg-primary text-black font-semibold text-sm hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 self-start cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <RiSendPlaneLine className="w-4 h-4" />
                  <span>Submit Comment</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default BlogComments;
