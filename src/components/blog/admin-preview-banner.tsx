"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  RiEyeLine,
  RiSendPlaneLine,
  RiPencilLine,
  RiLoader4Line,
} from "@remixicon/react";
import { blogService } from "@/services/blog.service";
import { authService } from "@/services/auth.service";
import { Blog } from "@/types";

interface AdminPreviewBannerProps {
  blog: Blog;
}

export function AdminPreviewBanner({ blog }: AdminPreviewBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If previewToken is in the query parameters, persist it and clean the address bar for privacy
    if (typeof window !== "undefined" && window.location.search.includes("previewToken")) {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("previewToken");
      if (token) {
        authService.setToken(token);
      }
      url.searchParams.delete("previewToken");
      window.history.replaceState({}, "", url.pathname + (url.search || ""));
    }
  }, []);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await blogService.togglePublish(blog._id);
      if (res.data?.success) {
        toast.success("Blog published successfully! Reloading...");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        toast.error(res.data?.message || "Failed to publish article");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to publish article");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <aside
      aria-label="Admin Preview Mode"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex items-center gap-2 p-1.5 pl-3 rounded-full bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-primary/40 shadow-2xl shadow-black/40 text-foreground transition-all duration-200 hover:shadow-2xl pointer-events-auto"
    >
      {/* Badge Indicator */}
      <div className="flex items-center gap-2 pr-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
          <RiEyeLine className="h-3.5 w-3.5 text-primary" />
          <span>Admin Preview</span>
        </div>
      </div>

      <div className="h-4 w-px bg-border/80" />

      {/* Quick Action: Publish */}
      <button
        type="button"
        onClick={handlePublish}
        disabled={isPublishing}
        title="Publish this article now"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-black hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
      >
        {isPublishing ? (
          <RiLoader4Line className="h-3.5 w-3.5 animate-spin" />
        ) : (<></>)}
        <span>Publish</span>
      </button>

    </aside>,
    document.body
  );
}

export default AdminPreviewBanner;
