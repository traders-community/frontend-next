"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiCheckLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiCheckboxCircleLine,
} from "@remixicon/react";
import { adminService } from "@/services/admin.service";
import { Comment } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { cn } from "@/lib/utils";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

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

  // Delete Comment Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingComment) return;
    try {
      setIsDeleting(true);
      const res = await adminService.deleteComment(deletingComment._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Comment deleted");
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
      key: "isApproved",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (item) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-2xs",
            item.isApproved
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          )}
        >
          {item.isApproved ? (
            <RiCheckboxCircleLine className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <RiTimeLine className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span>{item.isApproved ? "Approved" : "Pending"}</span>
        </span>
      ),
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
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {!item.isApproved && (
            <button
              type="button"
              onClick={() => handleApprove(item)}
              title="Approve comment"
              className="p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-colors cursor-pointer"
            >
              <RiCheckLine className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setDeletingComment(item)}
            title="Delete comment"
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
