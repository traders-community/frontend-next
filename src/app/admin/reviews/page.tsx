"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  RiStarFill,
  RiStarLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiEyeLine,
  RiShoppingBag3Line,
  RiShieldCheckLine,
} from "@remixicon/react";
import { productReviewService } from "@/services/product-review.service";
import { ProductReview, ProductReviewStatus } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "unapproved"
  >("all");

  // Summary counts
  const [stats, setStats] = useState<{
    totalReviews: number;
    pendingCount: number;
    approvedCount: number;
  }>({
    totalReviews: 0,
    pendingCount: 0,
    approvedCount: 0,
  });

  // Sorting: 3 states (asc, desc, null)
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    "desc"
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal State
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Delete Confirmation State
  const [deletingReview, setDeletingReview] = useState<ProductReview | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productReviewService.getAdminProductReviews({
        page: currentPage,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
        sort: sortKey || undefined,
        order: sortDirection || undefined,
      });

      if (res.data?.success) {
        setReviews(res.data.reviews || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        toast.error(res.data?.message || "Failed to load reviews");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching product reviews");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, search, sortKey, sortDirection]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Sort: 3 states (asc, desc, null)
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

  const getReviewStatus = (item: ProductReview): ProductReviewStatus => {
    if (item.status) return item.status;
    return item.isApproved ? "approved" : "pending";
  };

  // Approve Review
  const handleApprove = async (review: ProductReview) => {
    try {
      const res = await productReviewService.approveReview(review._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Review approved successfully");
        fetchReviews();
      } else {
        toast.error(res.data?.message || "Failed to approve review");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to approve review");
    }
  };

  // Unapprove Review
  const handleUnapprove = async (review: ProductReview) => {
    try {
      const res = await productReviewService.unapproveReview(review._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Review marked as unapproved");
        fetchReviews();
      } else {
        toast.error(res.data?.message || "Failed to unapprove review");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to unapprove review");
    }
  };

  // Reset Review to Pending
  const handleSetPending = async (review: ProductReview) => {
    try {
      const res = await productReviewService.updateReviewStatus(
        review._id,
        "pending"
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Review status reset to pending");
        fetchReviews();
      } else {
        toast.error(res.data?.message || "Failed to update review status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to update review status");
    }
  };

  // Delete Review Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    try {
      setIsDeleting(true);
      const res = await productReviewService.deleteReview(deletingReview._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Review deleted permanently");
        setDeletingReview(null);
        fetchReviews();
      } else {
        toast.error(res.data?.message || "Failed to delete review");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  // Columns definition conforming to AdminDataTable ColumnDef<T>
  const columns: ColumnDef<ProductReview>[] = [
    {
      key: "product",
      label: "PRODUCT",
      render: (item) => {
        const prod =
          typeof item.product === "object" && item.product !== null
            ? item.product
            : null;

        return (
          <div className="flex items-center gap-3 max-w-[200px]">
            {prod?.featuredImage ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted">
                <Image
                  src={prod.featuredImage}
                  alt={prod.title || "Product"}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface text-muted-foreground">
                <RiShoppingBag3Line className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="block font-medium text-foreground text-xs sm:text-sm truncate">
                {prod?.title || "Product"}
              </span>
              {prod?.slug && (
                <Link
                  href={`/product/${prod.slug}`}
                  target="_blank"
                  className="text-[11px] text-primary hover:underline inline-block truncate"
                >
                  View Page
                </Link>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "name",
      label: "CUSTOMER",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {item.name}
          </span>
          {item.email && (
            <span className="text-xs text-muted-foreground truncate max-w-[170px]">
              {item.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "RATING",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <RiStarFill
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= item.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-foreground">
            {Number(item.rating).toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      key: "comment",
      label: "REVIEW",
      render: (item) => (
        <div className="max-w-[280px]">
          {item.title && (
            <p className="font-semibold text-foreground text-xs truncate mb-0.5">
              {item.title}
            </p>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.comment}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (item) => {
        const status = getReviewStatus(item);
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
              status === "approved" &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
              status === "pending" &&
                "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
              status === "unapproved" &&
                "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20"
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "DATE",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (item) => {
        const status = getReviewStatus(item);
        return (
          <div className="flex items-center justify-end gap-1">
            {/* View Full Review */}
            <button
              type="button"
              onClick={() => {
                setSelectedReview(item);
                setDetailModalOpen(true);
              }}
              title="View full review"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
            >
              <RiEyeLine className="h-4 w-4" />
            </button>

            {/* Quick Action: Approve */}
            {status !== "approved" && (
              <button
                type="button"
                onClick={() => handleApprove(item)}
                title="Approve review"
                className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-colors cursor-pointer"
              >
                <RiCheckLine className="h-4 w-4" />
              </button>
            )}

            {/* Quick Action: Unapprove */}
            {status === "approved" && (
              <button
                type="button"
                onClick={() => handleUnapprove(item)}
                title="Unapprove review"
                className="p-1.5 rounded-lg text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors cursor-pointer"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
            )}

            {/* Quick Action: Set Pending */}
            {status === "unapproved" && (
              <button
                type="button"
                onClick={() => handleSetPending(item)}
                title="Reset to pending"
                className="p-1.5 rounded-lg text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-colors cursor-pointer"
              >
                <RiTimeLine className="h-4 w-4" />
              </button>
            )}

            {/* Delete Review */}
            <button
              type="button"
              onClick={() => setDeletingReview(item)}
              title="Delete review"
              className="p-1.5 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
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
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Product Reviews
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Moderate, approve, and review customer feedback for store products.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Reviews
            </span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <RiStarLine className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-foreground font-heading">
            {stats.totalReviews}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Moderation
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <RiTimeLine className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-500 font-heading">
            {stats.pendingCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Approved Live
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <RiShieldCheckLine className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-500 font-heading">
            {stats.approvedCount}
          </div>
        </div>
      </div>

      {/* Main AdminDataTable */}
      <AdminDataTable<ProductReview>
        title="Product Reviews"
        subtitle="Moderate, approve, and review customer feedback for store products"
        columns={columns}
        data={reviews}
        keyExtractor={(item) => item._id || item.id || ""}
        isLoading={loading}
        emptyMessage="No reviews found matching your filter criteria."
        searchValue={search}
        onSearchChange={(query) => {
          setSearch(query);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search reviews by customer, email, title, or comment..."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        filterActive={statusFilter !== "all"}
        filterContent={
          <div className="p-4 space-y-3 w-56">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Filter by Status
            </div>
            <div className="space-y-1.5">
              {(
                [
                  { label: "All Reviews", val: "all" },
                  { label: "Approved Only", val: "approved" },
                  { label: "Pending Only", val: "pending" },
                  { label: "Unapproved Only", val: "unapproved" },
                ] as const
              ).map((option) => (
                <button
                  key={option.val}
                  type="button"
                  onClick={() => {
                    setStatusFilter(option.val);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                    statusFilter === option.val
                      ? "bg-primary text-black font-semibold"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }
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
        }}
      />

      {/* Full Review Detail Modal */}
      {selectedReview && (
        <AdminModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedReview(null);
          }}
          title="Review Details"
          size="md"
        >
          <div className="space-y-5">
            {/* Product header */}
            {typeof selectedReview.product === "object" &&
              selectedReview.product !== null && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-surface">
                  {selectedReview.product.featuredImage ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={selectedReview.product.featuredImage}
                        alt={selectedReview.product.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <RiShoppingBag3Line className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </span>
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {selectedReview.product.title}
                    </h4>
                  </div>
                </div>
              )}

            {/* Reviewer Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border/80 bg-surface">
                <span className="text-muted-foreground block mb-0.5">
                  Customer
                </span>
                <span className="font-semibold text-foreground text-sm">
                  {selectedReview.name}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-border/80 bg-surface">
                <span className="text-muted-foreground block mb-0.5">
                  Email
                </span>
                <span className="font-semibold text-foreground text-sm truncate block">
                  {selectedReview.email || "Not provided"}
                </span>
              </div>
            </div>

            {/* Star Rating and Status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-surface">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Rating
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <RiStarFill
                        key={s}
                        className={cn(
                          "h-5 w-5",
                          s <= selectedReview.rating
                            ? "text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {selectedReview.rating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Status
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                    selectedReview.status === "approved" &&
                      "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                    selectedReview.status === "pending" &&
                      "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                    selectedReview.status === "unapproved" &&
                      "bg-neutral-500/10 text-neutral-500 border border-neutral-500/20"
                  )}
                >
                  {selectedReview.status}
                </span>
              </div>
            </div>

            {/* Review Title & Content */}
            <div className="p-4 rounded-xl border border-border/80 bg-surface space-y-2">
              {selectedReview.title && (
                <h5 className="font-bold text-foreground text-sm">
                  {selectedReview.title}
                </h5>
              )}
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedReview.comment}
              </p>
              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
                Submitted on {formatDateTime(selectedReview.createdAt)}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              {selectedReview.status !== "approved" && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleApprove(selectedReview);
                    setDetailModalOpen(false);
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Approve Review
                </button>
              )}

              {selectedReview.status === "approved" && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleUnapprove(selectedReview);
                    setDetailModalOpen(false);
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Unapprove Review
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border bg-card text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Confirmation Modal for Permanent Delete */}
      <ConfirmationModal
        isOpen={Boolean(deletingReview)}
        title="Delete Review?"
        description={`Are you sure you want to permanently delete the review from "${deletingReview?.name || "this user"}"? This action cannot be undone.`}
        confirmText="Delete Review"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingReview(null)}
      />
    </div>
  );
}
