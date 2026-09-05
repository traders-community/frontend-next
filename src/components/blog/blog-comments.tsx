"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { RiUserLine, RiSendPlaneLine, RiLoader4Line } from "@remixicon/react";
import { Comment } from "@/types";
import { blogService } from "@/services";
import { formatDate } from "@/lib/utils";

interface BlogCommentsProps {
  blogId: string;
  initialComments?: Comment[];
}

export function BlogComments({ blogId, initialComments = [] }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await blogService.getBlogComments(blogId);
      if (res.data?.success && res.data.comments) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error("Failed to refresh comments:", err);
    }
  };

  const handleAddComment = async (e: React.SubmitEvent) => {
    e.preventDefault();
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
        await fetchComments();
      } else {
        toast.error(res.data?.message || "Failed to submit comment.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error. Please try again.");
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
          {comments.length}
        </span>
      </h3>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-4 mb-10 w-full">
          {comments.map((comment) => (
            <article
              key={comment._id}
              className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center justify-center">
                    <RiUserLine className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-primary">
                    {comment.name}
                  </span>
                </div>

                <time className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </time>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed pl-9 whitespace-pre-wrap">
                {comment.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-8">
          No comments yet. Be the first to share your perspective!
        </p>
      )}

      {/* Add Comment Form */}
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
    </section>
  );
}

export default BlogComments;
