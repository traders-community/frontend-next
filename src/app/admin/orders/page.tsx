"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiMoneyDollarCircleLine,
  RiMailLine,
  RiPhoneLine,
  RiTelegramLine,
  RiCloseLine,
  RiTimeLine,
  RiCalendarLine,
  RiFileCopyLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiCheckLine,
} from "@remixicon/react";
import { orderService } from "@/services/order.service";
import { Order, OrderStats, PaymentStatus, SubscriptionStatus } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<
    "all" | SubscriptionStatus
  >("all");

  // Sorting
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<SubscriptionStatus>("ACTIVE");
  const [extendDays, setExtendDays] = useState<number | "">("");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch orders and statistics
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        orderService.getAdminOrders({
          page: currentPage,
          limit: pageSize,
          paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
          subscriptionStatus:
            subscriptionFilter === "all" ? undefined : subscriptionFilter,
          search: search.trim() || undefined,
          sort: sortKey || undefined,
          order: sortDirection || undefined,
        }),
        orderService.getAdminStats().catch(() => null),
      ]);

      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.orders || []);
        setTotalPages(ordersRes.data.totalPages || 1);
        setTotalItems(ordersRes.data.total || 0);
      } else {
        toast.error(ordersRes.data?.message || "Failed to load orders");
      }

      if (statsRes?.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    paymentFilter,
    subscriptionFilter,
    search,
    sortKey,
    sortDirection,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Sort Change: 3 states (asc, desc, null)
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

  // Open Details Modal
  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.subscriptionStatus);
    setEditNotes(order.adminNotes || "");
    setExtendDays("");
    setDetailModalOpen(true);
  };

  // Save Updates from Details Modal
  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const res = await orderService.updateSubscription(selectedOrder._id, {
        subscriptionStatus: editStatus,
        adminNotes: editNotes.trim(),
        extendDays: typeof extendDays === "number" && extendDays > 0 ? extendDays : undefined,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Subscription updated successfully");
        setDetailModalOpen(false);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update order");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error updating order");
    } finally {
      setIsUpdating(false);
    }
  };

  // Fast Admin Override: Mark User as Joined Telegram
  const handleMarkUserJoined = async () => {
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const res = await orderService.updateSubscription(selectedOrder._id, {
        telegramId: selectedOrder.telegramId || `manual_joined_${Date.now().toString().slice(-6)}`,
        telegramUsername: selectedOrder.telegramUsername || selectedOrder.firstName,
      });

      if (res.data?.success && res.data.order) {
        toast.success("Telegram member join status marked as verified!");
        setSelectedOrder(res.data.order);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update Telegram status.");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error updating Telegram status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Copy Telegram Invite Link to Clipboard
  const handleCopyLink = (link?: string) => {
    if (!link) {
      toast.info("No invite link generated yet.");
      return;
    }
    navigator.clipboard.writeText(link);
    toast.success("Telegram invite link copied to clipboard!");
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;

    try {
      setIsDeleting(true);
      const res = await orderService.deleteOrder(deletingOrder._id);
      if (res.data?.success) {
        toast.success("Order record deleted successfully");
        setDeletingOrder(null);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to delete order");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting order");
    } finally {
      setIsDeleting(false);
    }
  };

  // Render Subscription Status Badge
  const renderSubscriptionBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
            Active
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 shadow-2xs">
            Expired
          </span>
        );
      case "PENDING_PAYMENT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            Pending Pay
          </span>
        );
      case "REVOKED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-2xs">
            {status}
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>;
    }
  };

  // Render Payment Status Badge
  const renderPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Failed
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Refunded
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>;
    }
  };

  // Table Columns
  const columns: ColumnDef<Order>[] = [
    {
      key: "orderNumber",
      label: "ORDER #",
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <span
            onClick={() => handleOpenDetails(item)}
            className="font-mono font-bold text-xs text-primary hover:underline cursor-pointer block"
          >
            {item.orderNumber}
          </span>
          <span
            className="text-[11px] text-muted-foreground whitespace-nowrap block"
            title={formatDateTime(item.createdAt)}
          >
            {formatDate(item.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "CUSTOMER",
      render: (item) => (
        <div className="min-w-0 max-w-[200px]">
          <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
            {item.firstName} {item.lastName}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground truncate">
              {item.email}
            </span>
            {item.isEmailVerified && (
              <span
                title="Email verified via OTP"
                className="inline-flex items-center text-emerald-500 shrink-0"
              >
                <RiShieldCheckLine className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono block">
            {item.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      key: "plan",
      label: "SUBSCRIPTION PLAN",
      render: (item) => (
        <div className="space-y-1">
          <span className="font-medium text-foreground text-xs block truncate max-w-[180px]">
            {item.productTitle}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface border border-border/80 text-foreground">
              {item.variationTitle}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground">
              {item.sku}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5">
          <span className="font-bold text-foreground text-xs sm:text-sm block">
            ₹{item.amount?.toLocaleString("en-IN")}
          </span>
          {renderPaymentBadge(item.paymentStatus)}
        </div>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "STATUS",
      sortable: true,
      align: "center",
      render: (item) => (
        <div
          onClick={() => handleOpenDetails(item)}
          className="cursor-pointer"
          title="Click to view subscription controls"
        >
          {renderSubscriptionBadge(item.subscriptionStatus)}
        </div>
      ),
    },
    {
      key: "telegram",
      label: "TELEGRAM STATUS",
      render: (item) => {
        const isJoined = Boolean(item.telegramId || item.telegramJoinedAt);
        if (isJoined) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <RiCheckLine className="h-3.5 w-3.5" />
              <span>Joined {item.telegramUsername ? `@${item.telegramUsername.replace("@", "")}` : ""}</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Pending Join
          </span>
        );
      },
    },
    {
      key: "expiryDate",
      label: "EXPIRY DATE",
      sortable: true,
      render: (item) => {
        if (!item.expiryDate) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }

        const isExpired = new Date(item.expiryDate) < new Date();
        return (
          <div className="space-y-0.5">
            <span
              className={cn(
                "text-xs font-semibold block whitespace-nowrap",
                isExpired ? "text-red-500 line-through" : "text-foreground"
              )}
              title={formatDateTime(item.expiryDate)}
            >
              {formatDate(item.expiryDate)}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {isExpired ? "Expired" : "Active until date"}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (item) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* View Details */}
          <button
            type="button"
            onClick={() => handleOpenDetails(item)}
            title="Inspect & manage subscription"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiEyeLine className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setDeletingOrder(item)}
            title="Delete order"
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
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <RiMoneyDollarCircleLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            ₹{(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Active Memberships */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Members
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiTelegramLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.activeSubscriptions ?? "—"}
          </p>
        </div>

        {/* Pending Payments */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending Orders
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RiTimeLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.pendingPayments ?? "—"}
          </p>
        </div>

        {/* Expired Memberships */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Expired Members
            </span>
            <div className="h-7 w-7 rounded-lg bg-neutral-500/10 text-neutral-500 flex items-center justify-center">
              <RiCloseLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.expiredSubscriptions ?? "—"}
          </p>
        </div>
      </div>

      {/* Main Table via Reusable AdminDataTable */}
      <AdminDataTable<Order>
        title="Orders & Subscriptions"
        subtitle="Live payment records, customer OTP verification status, and Telegram membership expiry"
        searchPlaceholder="Search by order #, customer, email, phone, Telegram ID, or SKU..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        filterActive={paymentFilter !== "all" || subscriptionFilter !== "all"}
        filterContent={
          <div className="space-y-4 min-w-[240px]">
            {/* Payment Filter */}
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Payment
                </span>
                {paymentFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter("all");
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "All", val: "all" },
                  { label: "Paid", val: "PAID" },
                  { label: "Pending", val: "PENDING" },
                  { label: "Failed", val: "FAILED" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setPaymentFilter(opt.val as "all" | PaymentStatus);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                      paymentFilter === opt.val
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                        : "bg-surface text-muted-foreground hover:text-foreground border border-border/70"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription Status Filter */}
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subscription
                </span>
                {subscriptionFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionFilter("all");
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "All", val: "all" },
                  { label: "Active", val: "ACTIVE" },
                  { label: "Expired", val: "EXPIRED" },
                  { label: "Pending", val: "PENDING_PAYMENT" },
                  { label: "Revoked", val: "REVOKED" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setSubscriptionFilter(opt.val as "all" | SubscriptionStatus);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                      subscriptionFilter === opt.val
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                        : "bg-surface text-muted-foreground hover:text-foreground border border-border/70"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={orders}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No subscription orders found matching your filters."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
        }}
      />

      {/* Order Details & Subscription Inspection Modal */}
      <AdminModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Order & Subscription Details"
        subtitle="Inspect customer info, payment audit, Telegram channel linkage, and override validity"
        size="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Top Snapshot Card */}
            <div className="rounded-2xl bg-surface border border-border/70 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                <div>
                  <span className="font-mono text-xs font-bold text-primary block">
                    {selectedOrder.orderNumber}
                  </span>
                  <h4 className="font-bold text-foreground text-sm">
                    {selectedOrder.firstName} {selectedOrder.lastName}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {renderPaymentBadge(selectedOrder.paymentStatus)}
                  {renderSubscriptionBadge(selectedOrder.subscriptionStatus)}
                </div>
              </div>

              {/* Contact & Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiMailLine className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Email:{" "}
                    <strong className="text-foreground">
                      {selectedOrder.email}
                    </strong>{" "}
                    {selectedOrder.isEmailVerified && (
                      <span className="text-emerald-500 font-semibold">(Verified)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiPhoneLine className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Phone:{" "}
                    <strong className="text-foreground">
                      {selectedOrder.phoneNumber}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiCalendarLine className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Ordered:{" "}
                    <strong className="text-foreground">
                      {formatDateTime(selectedOrder.createdAt)}
                    </strong>
                  </span>
                </div>
                {selectedOrder.ipAddress && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RiInformationLine className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      IP:{" "}
                      <strong className="text-foreground">
                        {selectedOrder.ipAddress}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Plan & Payment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[11px]">
                  Product & Plan
                </span>
                <p className="font-bold text-sm text-foreground">
                  {selectedOrder.productTitle}
                </p>
                <div className="space-y-1 text-muted-foreground">
                  <p>• Tier: <strong className="text-foreground">{selectedOrder.variationTitle}</strong></p>
                  <p>• Duration: <strong className="text-foreground">{selectedOrder.durationValue} {selectedOrder.durationUnit}</strong></p>
                  <p>• SKU: <strong className="font-mono text-foreground">{selectedOrder.sku}</strong></p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[11px]">
                  Payment Audit
                </span>
                <p className="font-bold text-sm text-foreground">
                  ₹{selectedOrder.amount?.toLocaleString("en-IN")}{" "}
                  <span className="text-xs text-muted-foreground font-normal">({selectedOrder.currency})</span>
                </p>
                <div className="space-y-1 text-muted-foreground font-mono text-[11px]">
                  <p>• Gateway: {selectedOrder.paymentGateway}</p>
                  {selectedOrder.razorpayPaymentId && (
                    <p>• Pay ID: {selectedOrder.razorpayPaymentId}</p>
                  )}
                  {selectedOrder.paidAt && (
                    <p className="font-sans text-[11px]">• Paid: {formatDateTime(selectedOrder.paidAt)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Telegram Membership & Invite Card */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/15 pb-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <RiTelegramLine className="h-4 w-4" />
                  <span>Telegram Membership & Join Status</span>
                </div>
                {!selectedOrder.telegramId && !selectedOrder.telegramJoinedAt && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMarkUserJoined}
                    disabled={isUpdating}
                    className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 gap-1 cursor-pointer"
                  >
                    <RiCheckLine className="h-3.5 w-3.5" />
                    <span>Mark User as Joined</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Telegram Member Status:</span>
                  {selectedOrder.telegramId || selectedOrder.telegramJoinedAt ? (
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-500 font-semibold mt-0.5">
                      <RiCheckLine className="h-3.5 w-3.5" />
                      {selectedOrder.telegramId || "Joined"} {selectedOrder.telegramUsername ? `(@${selectedOrder.telegramUsername.replace("@", "")})` : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Pending User Join
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">Current Expiry:</span>
                  <strong className="text-foreground font-semibold block mt-0.5">
                    {selectedOrder.expiryDate
                      ? formatDateTime(selectedOrder.expiryDate)
                      : "Not started / No expiry"}
                  </strong>
                </div>
              </div>

              {selectedOrder.telegramInviteLink && !selectedOrder.telegramId && !selectedOrder.telegramJoinedAt && (
                <div className="pt-2 border-t border-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-muted-foreground block">
                      Single-Use Invite Link (Auto-expires upon join):
                    </span>
                    <span className="font-mono text-xs text-foreground truncate block">
                      {selectedOrder.telegramInviteLink}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(selectedOrder.telegramInviteLink)}
                    className="shrink-0 text-xs gap-1 cursor-pointer"
                  >
                    <RiFileCopyLine className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </Button>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-blue-500/10">
                ⚡ Note: On local development environments (<code className="font-mono text-[10px]">http://localhost</code>), Telegram cloud webhooks cannot ping localhost. Click <strong>"Mark User as Joined"</strong> to test or manually verify member join status.
              </p>
            </div>

            {/* Subscription Override Controls */}
            <div className="space-y-4 pt-2 border-t border-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Staff Override & Subscription Extension
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Update Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as SubscriptionStatus)
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-xl text-foreground font-semibold shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (In Channel)</option>
                    <option value="EXPIRED">EXPIRED (Removed by Cron)</option>
                    <option value="REVOKED">REVOKED (Manual Revocation)</option>
                    <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {/* Quick Extend Buttons */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Extend Subscription Duration
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[7, 30, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setExtendDays(days)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex-1 text-center",
                          extendDays === days
                            ? "bg-primary text-black border-transparent shadow-xs"
                            : "bg-surface text-muted-foreground hover:text-foreground border-border/80"
                        )}
                      >
                        +{days} Days
                      </button>
                    ))}
                    {extendDays !== "" && (
                      <button
                        type="button"
                        onClick={() => setExtendDays("")}
                        className="p-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Clear extension"
                      >
                        <RiCloseLine className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Internal Staff Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Extended subscription by 30 days due to manual transaction verification."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-3 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailModalOpen(false)}
                disabled={isUpdating}
                className="text-xs w-full sm:w-auto justify-center cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveOrderUpdates}
                disabled={isUpdating}
                className="text-xs w-full sm:w-auto justify-center cursor-pointer gap-1.5"
              >
                {isUpdating ? (
                  <>
                    <RiLoader4Line className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingOrder)}
        title="Delete Order Record?"
        description={`Are you sure you want to permanently delete order ${deletingOrder?.orderNumber} for ${deletingOrder?.firstName} ${deletingOrder?.lastName}? This action cannot be undone.`}
        confirmText="Delete Order"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingOrder(null)}
      />
    </div>
  );
}
