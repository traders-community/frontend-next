"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiUser3Line,
  RiMailLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiUserFollowLine,
  RiPercentLine,
} from "@remixicon/react";
import { newsletterService } from "@/services/newsletter.service";
import { Subscriber, NewsletterStats } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { formatDate, cn } from "@/lib/utils";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  // Sorting
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Add Subscriber Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [sendWelcome, setSendWelcome] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingSubscriber, setDeletingSubscriber] = useState<Subscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch subscribers & stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [subRes, statsRes] = await Promise.all([
        newsletterService.getSubscribers({
          page: currentPage,
          limit: pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
          sort: sortKey || undefined,
          order: sortDirection || undefined,
        }),
        newsletterService.getStats().catch(() => null),
      ]);

      if (subRes.data?.success) {
        setSubscribers(subRes.data.subscribers || []);
        setTotalPages(subRes.data.totalPages || 1);
        setTotalItems(subRes.data.total || 0);
      } else {
        toast.error(subRes.data?.message || "Failed to load subscribers");
      }

      if (statsRes?.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching subscribers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, search, sortKey, sortDirection]);

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

  // Toggle active status
  const handleToggleStatus = async (sub: Subscriber) => {
    try {
      const res = await newsletterService.toggleSubscriberStatus(sub._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Status updated");
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error toggling status");
    }
  };

  // Add Subscriber
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await newsletterService.createSubscriber({
        email: newEmail.trim(),
        name: newName.trim() || undefined,
        sendWelcome,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Subscriber added successfully");
        setIsAddModalOpen(false);
        setNewEmail("");
        setNewName("");
        setSendWelcome(true);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to add subscriber");
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || err.message || "Error adding subscriber");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingSubscriber) return;
    try {
      setIsDeleting(true);
      const res = await newsletterService.deleteSubscriber(deletingSubscriber._id);
      if (res.data?.success) {
        toast.success("Subscriber removed successfully");
        setDeletingSubscriber(null);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to delete subscriber");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting subscriber");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format source label
  const formatSource = (source?: string) => {
    if (source === "manual_admin") return "Admin Portal";
    if (source === "footer_form") return "Footer Form";
    return source || "Web Form";
  };

  // Column definitions
  const columns: ColumnDef<Subscriber>[] = [
    {
      key: "email",
      label: "Subscriber Email",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <RiMailLine className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
              {item.email}
            </span>
            {item.name && item.name !== "Trader" && (
              <span className="text-[11px] text-muted-foreground block truncate">
                {item.name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (item) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(item)}
          title={`Click to mark as ${item.isActive ? "Unsubscribed" : "Active"}`}
          className="cursor-pointer focus:outline-none inline-block group/btn"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-2xs",
              item.isActive
                ? "bg-black text-white dark:bg-white dark:text-black group-hover/btn:opacity-85"
                : "bg-surface text-muted-foreground group-hover/btn:text-foreground border border-border/80"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                item.isActive ? "bg-emerald-400" : "bg-muted-foreground"
              )}
            />
            <span>{item.isActive ? "Active" : "Unsubscribed"}</span>
          </span>
        </button>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-muted/70 text-muted-foreground">
          {formatSource(item.source)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Subscribed Date",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setDeletingSubscriber(item)}
            title="Delete subscriber"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
          >
            <RiDeleteBinLine className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const activeCount = stats?.activeSubscribers ?? subscribers.filter((s) => s.isActive).length;
  const totalCount = stats?.totalSubscribers ?? totalItems;
  const unsubCount = stats?.unsubscribedCount ?? (totalCount - activeCount);
  const activeRate = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(0) : "100";

  return (
    <div className="space-y-6">
      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Subscribers */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Subscribers
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiUserFollowLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{totalCount}</p>
        </div>

        {/* Active Subscribers */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Subscribers
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <RiCheckboxCircleLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{activeCount}</p>
        </div>

        {/* Unsubscribed */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unsubscribed
            </span>
            <div className="h-7 w-7 rounded-lg bg-surface text-muted-foreground flex items-center justify-center border border-border/60">
              <RiCloseCircleLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{unsubCount}</p>
        </div>

        {/* Active Rate */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Retention Rate
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiPercentLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{activeRate}%</p>
        </div>
      </div>

      {/* Main Subscribers Table */}
      <AdminDataTable
        title="Subscribers"
        subtitle="Manage and view members subscribed to your market analysis reports"
        searchPlaceholder="Search email, name or source..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        actionButton={{
          label: "Add Subscriber",
          onClick: () => setIsAddModalOpen(true),
          icon: RiAddLine,
        }}
        filterActive={statusFilter !== "all"}
        filterContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold text-foreground">Filter by Status</span>
              {statusFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1">
              {[
                { label: "All Subscribers", val: "all" },
                { label: "Active", val: "active" },
                { label: "Unsubscribed", val: "unsubscribed" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.val as "all" | "active" | "unsubscribed");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                    statusFilter === opt.val
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-foreground hover:bg-surface-hover"
                  )}
                >
                  <span>{opt.label}</span>
                  {statusFilter === opt.val && <RiCheckLine className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        }
        columns={columns}
        data={subscribers}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No subscribers found matching your search or filters."
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

      {/* Add Subscriber Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Subscriber"
        subtitle="Manually register an email address to the newsletter distribution list"
        size="md"
      >
        <form onSubmit={handleAddSubscriber} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="subscriber@example.com"
              required
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Subscriber Name (Optional)
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-border/70 bg-surface/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">Send Welcome Email</p>
              <p className="text-[11px] text-muted-foreground">
                Dispatches the confirmation welcome email instantly
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendWelcome}
                onChange={(e) => setSendWelcome(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-2xs"></div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-foreground bg-surface hover:bg-surface/80 border border-border/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newEmail.trim()}
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="h-3.5 w-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isSubmitting ? "Adding..." : "Add Subscriber"}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingSubscriber)}
        title="Remove Subscriber"
        description={`Are you sure you want to delete ${deletingSubscriber?.email}? They will no longer receive any automated newsletters or market reports.`}
        confirmText="Delete Subscriber"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSubscriber(null)}
      />
    </div>
  );
}
