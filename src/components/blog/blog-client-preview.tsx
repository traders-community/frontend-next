"use client";

import React, { useEffect, useState } from "react";
import { Blog, AdminProfile, Comment } from "@/types";
import { authService, blogService, settingsService } from "@/services";
import { BlogDetailView } from "./blog-detail-view";
import { Button } from "@/components/ui/button";
import { RiHome4Line, RiLoader4Line } from "@remixicon/react";

interface BlogClientPreviewProps {
  slug: string;
  initialProfile?: AdminProfile | null;
}

export function BlogClientPreview({ slug, initialProfile }: BlogClientPreviewProps) {
  const [status, setStatus] = useState<"loading" | "authorized" | "not-found">("loading");
  const [blog, setBlog] = useState<Blog | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(initialProfile || null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function checkAuthAndFetch() {
      // 1. Strictly verify if admin token is present in localStorage
      const token = authService.getToken();
      if (!token) {
        if (!isCancelled) setStatus("not-found");
        return;
      }

      // 2. Mirror token to cookie for subsequent SSR requests
      authService.syncTokenCookie();

      try {
        // 3. Fetch draft blog directly using client api (which forwards localStorage token)
        const [blogRes, profileRes] = await Promise.all([
          blogService.getBlogById(slug, 0),
          !initialProfile ? settingsService.getPublicProfile(60) : Promise.resolve(null),
        ]);

        if (isCancelled) return;

        if (blogRes.success && blogRes.data?.blog) {
          setBlog(blogRes.data.blog);
          if (profileRes?.data?.profile) {
            setProfile(profileRes.data.profile);
          }

          // Fetch comments if authorized
          try {
            const commentsRes = await blogService.getBlogComments(slug);
            if (!isCancelled && commentsRes.data?.comments) {
              setComments(commentsRes.data.comments);
            }
          } catch {
            // Comments failure is non-blocking for preview
          }

          setStatus("authorized");
        } else {
          setStatus("not-found");
        }
      } catch {
        if (!isCancelled) setStatus("not-found");
      }
    }

    checkAuthAndFetch();

    return () => {
      isCancelled = true;
    };
  }, [slug, initialProfile]);

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-foreground px-4">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Verifying admin preview authorization...
          </p>
        </div>
      </div>
    );
  }

  // Not Found / Unauthorized State (matches standard 404 page)
  if (status === "not-found" || !blog) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground transition-colors duration-150">
        <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />

        <div className="relative z-10 mx-auto max-w-lg text-center">
          <h1 className="mt-4 text-7xl font-extrabold tracking-tight sm:text-9xl">
            <span className="text-primary">4</span>
            <span className="text-foreground">0</span>
            <span className="text-primary">4</span>
          </h1>

          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Page Not Found
          </h2>

          <p className="mt-3 leading-relaxed text-muted-foreground sm:text-base">
            The page you are looking for doesn&apos;t exist, has been
            relocated, or is temporarily unavailable in this session.
          </p>

          <div className="mt-8 flex justify-center">
            <Button href="/" variant="primary" size="md">
              <RiHome4Line className="h-4 w-4" />
              <span>Return Home</span>
            </Button>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            Need assistance? Reach out to{" "}
            <a
              href="mailto:care.traderscommunity@gmail.com"
              className="text-primary underline underline-offset-4 hover:text-primary-hover transition-colors"
            >
              care.traderscommunity@gmail.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Authorized Admin Preview Mode
  return (
    <BlogDetailView
      blog={blog}
      profile={profile}
      initialComments={comments}
      isDraftPreview={!blog.isPublished}
    />
  );
}

export default BlogClientPreview;
