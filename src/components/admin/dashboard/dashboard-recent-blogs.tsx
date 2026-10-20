"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RiArticleLine,
  RiEditLine,
  RiEyeLine,
  RiExternalLinkLine,
  RiImageLine,
} from "@remixicon/react";
import { DashboardRecentBlog } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";

interface DashboardRecentBlogsProps {
  blogs: DashboardRecentBlog[];
  publishedCount: number;
  draftCount: number;
  isLoading?: boolean;
}

export function DashboardRecentBlogs({
  blogs = [],
  publishedCount = 0,
  draftCount = 0,
  isLoading = false,
}: DashboardRecentBlogsProps) {
  const [selectedBlog, setSelectedBlog] = useState<DashboardRecentBlog | null>(null);

  const columns: ColumnDef<DashboardRecentBlog>[] = [
    {
      key: "image",
      label: "Image",
      className: "w-16 pr-2",
      render: (blog) => (
        <div className="relative w-12 h-9 rounded-md overflow-hidden bg-muted border border-border/60 shrink-0 flex items-center justify-center">
          {blog.image ? (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <RiImageLine className="size-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title & Slug",
      render: (blog) => (
        <div className="min-w-0 max-w-md">
          <span className="font-semibold text-foreground text-xs sm:text-sm block truncate group-hover:text-primary transition-colors">
            {blog.title}
          </span>
          {blog.slug && (
            <span className="text-[11px] text-muted-foreground block truncate font-mono mt-0.5">
              /{blog.slug}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (blog) => (
        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-surface border border-border/80 text-foreground">
          {blog.category || "General"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (blog) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border",
            blog.isPublished
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {blog.isPublished ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      className: "text-muted-foreground font-mono text-xs",
      render: (blog) => formatDate(blog.createdAt),
    },
    {
      key: "actions",
      label: "Quick Access",
      align: "right",
      render: (blog) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSelectedBlog(blog)}
            title="Quick Preview"
            className="p-1.5 rounded-lg border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <RiEyeLine className="size-4" />
          </button>
          <Link
            href={`/admin/editBlog/${blog._id}`}
            title="Edit Blog"
            className="p-1.5 rounded-lg border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <RiEditLine className="size-4" />
          </Link>
          {blog.isPublished && blog.slug && (
            <Link
              href={`/blog/${blog.slug}`}
              target="_blank"
              rel="noreferrer"
              title="Open Public Article"
              className="p-1.5 rounded-lg border border-border/60 hover:border-foreground/30 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            >
              <RiExternalLinkLine className="size-4" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminDataTable<DashboardRecentBlog>
        variant="card"
        icon={RiArticleLine}
        title="Recent Blogs"
        subtitle={`${publishedCount} published • ${draftCount} drafts`}
        actionButton={{
          label: "View All Blogs",
          href: "/admin/listBlog",
        }}
        columns={columns}
        data={blogs}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        emptyMessage="No recent blogs published yet."
        onRowClick={(item) => setSelectedBlog(item)}
      />

      {/* Blog Details / Quick Preview Modal */}
      {selectedBlog && (
        <AdminModal
          isOpen={!!selectedBlog}
          onClose={() => setSelectedBlog(null)}
          title="Blog Post Overview"
          size="lg"
        >
          <div className="space-y-5">
            {/* Image Thumbnail Banner */}
            {selectedBlog.image && (
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-border bg-muted">
                <img
                  src={selectedBlog.image}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-surface border border-border/80 text-foreground">
                {selectedBlog.category || "General"}
              </span>
              <span
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-semibold border",
                  selectedBlog.isPublished
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {selectedBlog.isPublished ? "Published" : "Draft"}
              </span>
              <span className="text-xs text-muted-foreground ml-auto font-mono">
                {formatDate(selectedBlog.createdAt)}
              </span>
            </div>

            {/* Title & Slug */}
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {selectedBlog.title}
              </h3>
              {selectedBlog.slug && (
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  URL slug: /{selectedBlog.slug}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              >
                Close
              </button>
              {selectedBlog.isPublished && selectedBlog.slug && (
                <Link
                  href={`/blog/${selectedBlog.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-surface text-foreground transition-colors"
                >
                  <RiExternalLinkLine className="size-3.5" />
                  <span>View Public Post</span>
                </Link>
              )}
              <Link
                href={`/admin/editBlog/${selectedBlog._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-black hover:bg-primary-hover shadow-xs transition-colors"
              >
                <RiEditLine className="size-3.5" />
                <span>Edit Full Post</span>
              </Link>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  );
}
