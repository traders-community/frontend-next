"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RiArticleLine,
  RiChat1Line,
  RiCustomerService2Line,
  RiCheckLine,
  RiArrowRightLine,
} from "@remixicon/react";
import {
  DashboardRecentBlog,
  DashboardRecentComment,
  DashboardRecentTicket,
} from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { toast } from "react-toastify";

interface DashboardActivityCardsProps {
  blogs: DashboardRecentBlog[];
  comments: DashboardRecentComment[];
  tickets: DashboardRecentTicket[];
  publishedBlogsCount: number;
  draftBlogsCount: number;
  pendingCommentsCount: number;
  openTicketsCount: number;
  isLoading?: boolean;
}

export function DashboardActivityCards({
  blogs = [],
  comments = [],
  tickets = [],
  publishedBlogsCount = 0,
  draftBlogsCount = 0,
  pendingCommentsCount = 0,
  openTicketsCount = 0,
  isLoading = false,
}: DashboardActivityCardsProps) {
  const [localComments, setLocalComments] = useState<DashboardRecentComment[]>(comments);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Sync state if initial prop changes
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleApproveComment = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setApprovingId(id);
      const res = await adminService.approveComment(id);
      if (res.data?.success) {
        toast.success("Comment approved");
        setLocalComments((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, status: "approved", isApproved: true }
              : c
          )
        );
      } else {
        toast.error(res.data?.message || "Failed to approve comment");
      }
    } catch {
      toast.error("Failed to approve comment");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* 1. Recent Blogs Card */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <RiArticleLine className="size-4.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Recent Blogs
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {publishedBlogsCount} published &bull; {draftBlogsCount} drafts
                </p>
              </div>
            </div>
            <Link
              href="/admin/listBlog"
              className="text-xs font-medium text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <RiArrowRightLine className="size-3" />
            </Link>
          </div>

          {/* List of 3 items */}
          <div className="mt-3.5 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1.5 py-1">
                  <div className="h-3.5 w-3/4 bg-muted rounded" />
                  <div className="h-2.5 w-1/2 bg-muted/70 rounded" />
                </div>
              ))
            ) : blogs.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No blogs created yet
              </div>
            ) : (
              blogs.map((b) => (
                <div
                  key={b._id}
                  className="flex items-start justify-between gap-3 text-xs border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate" title={b.title}>
                      {b.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      {b.category && (
                        <span className="truncate max-w-[100px]">{b.category}</span>
                      )}
                      <span>&bull;</span>
                      <span>{formatDate(b.createdAt)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                        b.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
                      )}
                    >
                      {b.isPublished ? "Published" : "Draft"}
                    </span>
                    <Link
                      href={`/admin/editBlog/${b._id}`}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Recent Comments Card with Instant Direct Approve Action */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <RiChat1Line className="size-4.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Comments
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {pendingCommentsCount} awaiting approval
                </p>
              </div>
            </div>
            <Link
              href="/admin/comments"
              className="text-xs font-medium text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <RiArrowRightLine className="size-3" />
            </Link>
          </div>

          {/* List of 3 items */}
          <div className="mt-3.5 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1.5 py-1">
                  <div className="h-3.5 w-3/4 bg-muted rounded" />
                  <div className="h-2.5 w-1/2 bg-muted/70 rounded" />
                </div>
              ))
            ) : localComments.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No user comments yet
              </div>
            ) : (
              localComments.map((c) => {
                const isPending = c.status === "pending" || !c.isApproved;
                const isApproving = approvingId === c._id;

                return (
                  <div
                    key={c._id}
                    className="flex items-start justify-between gap-3 text-xs border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {c.name || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      <p
                        className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5"
                        title={c.content}
                      >
                        {c.content}
                      </p>
                      {typeof c.blog === "object" && c.blog !== null && "title" in c.blog && c.blog.title && (
                        <p className="text-[10px] text-muted-foreground/75 truncate mt-0.5">
                          on: {c.blog.title}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isPending ? (
                        <button
                          type="button"
                          disabled={isApproving}
                          onClick={(e) => handleApproveComment(c._id, e)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold",
                            "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20",
                            "transition-colors disabled:opacity-50"
                          )}
                          title="Approve comment"
                        >
                          <RiCheckLine className="size-3" />
                          <span>{isApproving ? "..." : "Approve"}</span>
                        </button>
                      ) : (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Support Tickets Card */}
      <div className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <RiCustomerService2Line className="size-4.5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Support Tickets
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {openTicketsCount} new tickets open
                </p>
              </div>
            </div>
            <Link
              href="/admin/support"
              className="text-xs font-medium text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <RiArrowRightLine className="size-3" />
            </Link>
          </div>

          {/* List of 3 items */}
          <div className="mt-3.5 space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1.5 py-1">
                  <div className="h-3.5 w-3/4 bg-muted rounded" />
                  <div className="h-2.5 w-1/2 bg-muted/70 rounded" />
                </div>
              ))
            ) : tickets.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No active support tickets
              </div>
            ) : (
              tickets.map((t) => {
                const isNew = t.status === "NEW";
                const isResolved = t.status === "RESOLVED";

                return (
                  <div
                    key={t._id}
                    className="flex items-start justify-between gap-3 text-xs border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground font-medium truncate mt-0.5">
                        {t.topic || "General Query"}
                      </p>
                      <p
                        className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5"
                        title={t.message}
                      >
                        {t.message}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                          isNew
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : isResolved
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}
                      >
                        {t.status}
                      </span>
                      <Link
                        href="/admin/support"
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
