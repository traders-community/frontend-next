"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from "@remixicon/react";
import { adminService } from "@/services/admin.service";
import { Comment, CommentStatus } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { cn } from "@/lib/utils";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "unapproved">("all");

  // Sorting: 3 states (1. asc, 2. desc, 3. nothing)
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete Confirmation State
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllComments({
        page: currentPage,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
        sort: sortKey || undefined,
        order: sortDirection || undefined,
      });

      if (res.data?.success) {
        setComments(res.data.comments || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
      } else {
        toast.error(res.data?.message || "Failed to load comments");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching comments");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, search, sortKey, sortDirection]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle Sort: 3 states (1. asc, 2. desc, 3. nothing)
  const handleSortChange = (key: string) => {
    setCurrentPage(1);
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getCommentStatus = (item: Comment): CommentStatus => {
    if (item.status) return item.status;
    return item.isApproved ? "approved" : "pending";
  };

  // Approve Comment
  const handleApprove = async (comment: Comment) => {
    try {
      const res = await adminService.approveComment(comment._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Comment approved");
        fetchComments();
      } else {
        toast.error(res.data?.message || "Failed to approve comment");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to approve comment");
    }
  };

  // Unapprove Comment (does NOT delete)
  const handleUnapprove = async (comment: Comment) => {
    try {
      const res = await adminService.unapproveComment(comment._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Comment marked as unapproved");
        fetchComments();
      } else {
        toast.error(res.data?.message || "Failed to unapprove comment");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to unapprove comment");
    }
  };

  // Reset Comment to Pending
  const handleSetPending = async (comment: Comment) => {
    try {
      const res = await adminService.updateCommentStatus(comment._id, "pending");
      if (res.data?.success) {
        toast.success(res.data.message || "Comment status reset to pending");
        fetchComments();
      } else {
        toast.error(res.data?.message || "Failed to update comment status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to update comment status");
    }
  };

  // Delete Comment Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingComment) return;
    try {
      setIsDeleting(true);
      const res = await adminService.deleteComment(deletingComment._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Comment deleted permanently");
        setDeletingComment(null);
        fetchComments();
      } else {
        toast.error(res.data?.message || "Failed to delete comment");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Comment>[] = [
    {
      key: "name",
      label: "COMMENT",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <p className="font-semibold text-foreground text-sm flex items-center gap-2">
            <span>{item.name || "Anonymous"}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {item.content}
          </p>
        </div>
      ),
    },
    {
      key: "blog",
      label: "POST",
      render: (item) => (
        <p className="text-xs font-medium text-foreground max-w-[200px] truncate">
          {(typeof item.blog === "object" ? item.blog?.title : null) || "Associated Post"}
        </p>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (item) => {
        const status = getCommentStatus(item);
        if (status === "approved") {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <RiCheckboxCircleLine className="h-3.5 w-3.5 text-emerald-500" />
              <span>Approved</span>
            </span>
          );
        }
        if (status === "unapproved") {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
              <RiCloseCircleLine className="h-3.5 w-3.5 text-rose-500" />
              <span>Unapproved</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            <RiTimeLine className="h-3.5 w-3.5 text-amber-500" />
            <span>Pending</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "DATE",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-US", {
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
      render: (item) => {
        const status = getCommentStatus(item);
        return (
          <div className="flex items-center justify-end gap-1.5">
            {status !== "approved" && (
              <button
                type="button"
                onClick={() => handleApprove(item)}
                title="Approve comment"
                className="p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-colors cursor-pointer"
              >
                <RiCheckLine className="h-4 w-4" />
              </button>
            )}
            {status !== "unapproved" && (
              <button
                type="button"
                onClick={() => handleUnapprove(item)}
                title="Unapprove comment (removes from public without deleting)"
                className="p-2 rounded-xl text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
            )}
            {status !== "pending" && (
              <button
                type="button"
                onClick={() => handleSetPending(item)}
                title="Reset to Pending"
                className="p-2 rounded-xl text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors cursor-pointer"
              >
                <RiTimeLine className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setDeletingComment(item)}
              title="Delete comment permanently"
              className="p-2 rounded-xl text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
            >
              <RiDeleteBinLine className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Single Reusable Table Component */}
      <AdminDataTable<Comment>
        title="Comments"
        subtitle="Moderate reader questions, discussion, and community feedback"
        searchPlaceholder="Search comments or users..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        filterActive={statusFilter !== "all"}
        filterContent={
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Approval Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "all"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("pending");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "pending"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("approved");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "approved"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Approved
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("unapproved");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "unapproved"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Unapproved
                </button>
              </div>
            </div>

            {statusFilter !== "all" && (
              <div className="pt-2 border-t border-border/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
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
        columns={columns}
        data={comments}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No comments found under this status filter."
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingComment)}
        title="Delete Comment?"
        description="Are you sure you want to permanently delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingComment(null)}
      />
    </div>
  );
}
