"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiAddLine,
} from "@remixicon/react";
import { blogService } from "@/services/blog.service";
import { categoryService } from "@/services/category.service";
import { Blog, Category } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { AddBlogForm } from "@/components/admin/add-blog-form";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { cn } from "@/lib/utils";

export default function AdminListBlogPage() {
  const router = useRouter();

  // Data State
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categories, setCategories] = useState<Category[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting: 3 states (1. asc, 2. desc, 3. nothing)
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Delete Confirmation State
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories for filtering
  useEffect(() => {
    categoryService
      .getPublicCategories()
      .then((res) => {
        if (res.data?.categories) setCategories(res.data.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch blogs from backend
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await blogService.getAllBlogsAdmin({
        page: currentPage,
        limit: pageSize,
        search: search.trim() || undefined,
        status:
          statusFilter === "ALL"
            ? undefined
            : statusFilter === "PUBLISHED"
            ? "published"
            : "draft",
        category: categoryFilter === "All" ? undefined : categoryFilter,
        sort: sortKey || undefined,
        order: sortDirection || undefined,
      });

      if (res.data?.success) {
        setBlogs(res.data.blogs || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
      } else {
        toast.error(res.data?.message || "Failed to load blogs");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching blogs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, statusFilter, categoryFilter, sortKey, sortDirection]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle Sort: 3 states (1. asc, 2. desc, 3. nothing)
  const handleSortChange = (key: string) => {
    setCurrentPage(1);
    if (sortKey !== key) {
      // 1. First click on a column: ASC
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      // 2. Second click: DESC
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      // 3. Third click: NOTHING (reset sort)
      setSortKey(null);
      setSortDirection(null);
    } else {
      // From nothing: ASC
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Toggle publish
  const handleTogglePublish = async (blog: Blog) => {
    try {
      const res = await blogService.togglePublish(blog._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Status updated");
        fetchBlogs();
      } else {
        toast.error(res.data?.message || "Failed to toggle status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to update blog status");
    }
  };

  // Delete blog confirmation
  const handleConfirmDelete = async () => {
    if (!deletingBlog) return;
    try {
      setIsDeleting(true);
      const res = await blogService.deleteBlog(deletingBlog._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Blog deleted successfully");
        setDeletingBlog(null);
        // Refresh page or go back a page if needed
        if (blogs.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchBlogs();
        }
      } else {
        toast.error(res.data?.message || "Failed to delete blog");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting blog");
    } finally {
      setIsDeleting(false);
    }
  };

  // Define Columns matching screenshot style
  const columns: ColumnDef<Blog>[] = [
    {
      key: "title",
      label: "POST",
      sortable: true,
      render: (blog) => (
        <div className="flex items-center gap-3.5 max-w-[320px] sm:max-w-md">
          {/* Thumbnail */}
          <div className="w-16 aspect-video rounded-xl overflow-hidden bg-surface shrink-0 border border-border/70 relative group">
            {blog.image ? (
              <PhotoView src={blog.image}>
                <div className="h-full w-full cursor-zoom-in relative">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <RiEyeLine className="h-4 w-4 text-white drop-shadow" />
                  </div>
                </div>
              </PhotoView>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground bg-primary/10 text-primary">
                {blog.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-sm truncate leading-snug">
              {blog.title}
            </p>
            {blog.subTitle && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {blog.subTitle}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      sortable: true,
      render: (blog) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface text-foreground border border-border/70">
          {blog.category || "General"}
        </span>
      ),
    },
    {
      key: "isPublished",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (blog) => (
        <button
          type="button"
          onClick={() => handleTogglePublish(blog)}
          title={`Click to ${blog.isPublished ? "Unpublish" : "Publish"}`}
          className="group cursor-pointer focus:outline-none"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-2xs",
              blog.isPublished
                ? "bg-black text-white dark:bg-white dark:text-black group-hover:opacity-85"
                : "bg-surface text-muted-foreground group-hover:text-foreground border border-border/80"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                blog.isPublished ? "bg-emerald-400" : "bg-muted-foreground"
              )}
            />
            <span>{blog.isPublished ? "Published" : "Unpublished"}</span>
          </span>
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "DATE",
      sortable: true,
      render: (blog) => (
        <span className="text-xs text-muted-foreground">
          {blog.createdAt
            ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (blog) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* View Preview */}
          <Link
            href={`/blog/${blog.slug || blog._id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview article"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors"
          >
            <RiEyeLine className="h-4 w-4" />
          </Link>

          {/* Edit */}
          <button
            type="button"
            onClick={() => {
              setIsFormDirty(false);
              setEditingBlog(blog);
            }}
            title="Edit post"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiPencilLine className="h-4 w-4" />
          </button>

          {/* Delete (Red) */}
          <button
            type="button"
            onClick={() => setDeletingBlog(blog)}
            title="Delete post"
            className="p-2 rounded-xl text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
          >
            <RiDeleteBinLine className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Single Reusable Table Component with full-screen photo viewer */}
      <PhotoProvider speed={() => 300} maskOpacity={0.85}>
        <AdminDataTable<Blog>
        title="Blog Posts"
        subtitle="Manage articles, publication statuses, and resources across the platform"
        searchPlaceholder="Search posts..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        filterActive={statusFilter !== "ALL" || categoryFilter !== "All"}
        filterContent={
          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "ALL"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("PUBLISHED");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "PUBLISHED"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("DRAFT");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "DRAFT"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Unpublished
                </button>
              </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("All");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                      categoryFilter === "All"
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    )}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(cat.name);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer truncate max-w-[140px]",
                        categoryFilter === cat.name
                          ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      )}
                      title={cat.name}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Option */}
            {(statusFilter !== "ALL" || categoryFilter !== "All") && (
              <div className="pt-2 border-t border-border/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setCategoryFilter("All");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        }
        actionButton={{
          label: "Add Post",
          icon: RiAddLine,
          onClick: () => {
            setIsFormDirty(false);
            setIsAddModalOpen(true);
          },
        }}
        columns={columns}
        data={blogs}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No blog posts found. Click '+ Add Post' to publish your first article."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: (page) => setCurrentPage(page),
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 10, 20, 50],
        }}
      />
      </PhotoProvider>

      {/* Add Blog Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Post"
        subtitle="Write a new article or open in a full page for extensive editing"
        externalHref="/admin/addBlog"
        externalTitle="Open in full page editor"
        size="3xl"
        isDirty={isFormDirty}
      >
        <AddBlogForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchBlogs();
          }}
          onCancel={() => setIsAddModalOpen(false)}
          onDirtyChange={setIsFormDirty}
        />
      </AdminModal>

      {/* Edit Blog Modal */}
      <AdminModal
        isOpen={Boolean(editingBlog)}
        onClose={() => setEditingBlog(null)}
        title="Edit Post"
        subtitle={`Updating: ${editingBlog?.title || "Blog post"}`}
        size="3xl"
        isDirty={isFormDirty}
      >
        {editingBlog && (
          <AddBlogForm
            initialData={editingBlog}
            isEdit={true}
            onSuccess={() => {
              setEditingBlog(null);
              fetchBlogs();
            }}
            onCancel={() => setEditingBlog(null)}
            onDirtyChange={setIsFormDirty}
          />
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingBlog)}
        title="Delete Blog Post?"
        description={`Are you sure you want to delete "${deletingBlog?.title}"? This action cannot be undone and will permanently remove the post.`}
        confirmText="Delete Post"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBlog(null)}
      />
    </div>
  );
}
