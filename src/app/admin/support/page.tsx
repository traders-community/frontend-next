"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  RiCustomerService2Line,
  RiMailLine,
  RiPhoneLine,
  RiInboxLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiSendPlaneLine,
  RiChatCheckLine,
  RiCheckLine,
  RiCalendarLine,
  RiComputerLine,
  RiInformationLine,
} from "@remixicon/react";
import { supportService } from "@/services/support.service";
import { SupportTicket, SupportTicketStatus, SupportTicketStats } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

const TOPIC_OPTIONS = [
  "All Topics",
  "General Query",
  "Courses & Learning Program",
  "Technical Analysis Reports",
  "Mentorship Assistance",
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SupportTicketStatus>("all");
  const [topicFilter, setTopicFilter] = useState<string>("All Topics");

  // Sorting: 3 states (asc, desc, null)
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Details Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<SupportTicketStatus>("NEW");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [deletingTicket, setDeletingTicket] = useState<SupportTicket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tickets and statistics
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        supportService.getTickets({
          page: currentPage,
          limit: pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          topic: topicFilter === "All Topics" ? undefined : topicFilter,
          search: search.trim() || undefined,
          sort: sortKey || undefined,
          order: sortDirection || undefined,
        }),
        supportService.getStats().catch(() => null),
      ]);

      if (ticketsRes.data?.success) {
        setTickets(ticketsRes.data.tickets || []);
        setTotalPages(ticketsRes.data.totalPages || 1);
        setTotalItems(ticketsRes.data.total || 0);
      } else {
        toast.error(ticketsRes.data?.message || "Failed to load support inquiries");
      }

      if (statsRes?.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching support inquiries");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, topicFilter, search, sortKey, sortDirection]);

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
  const handleOpenDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditNotes(ticket.adminNotes || "");
    setDetailModalOpen(true);
  };

  // Save Updates from Details Modal
  const handleSaveTicketUpdates = async () => {
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);
      const res = await supportService.updateTicket(selectedTicket._id, {
        status: editStatus,
        adminNotes: editNotes.trim(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Inquiry updated successfully");
        setDetailModalOpen(false);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update inquiry");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error updating inquiry");
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick 1-Click Status Cycle in Table Row
  const handleCycleStatus = async (ticket: SupportTicket, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatusMap: Record<SupportTicketStatus, SupportTicketStatus> = {
      NEW: "CONTACTED",
      CONTACTED: "RESOLVED",
      RESOLVED: "NEW",
    };
    const nextStatus = nextStatusMap[ticket.status] || "NEW";

    try {
      const res = await supportService.updateTicket(ticket._id, {
        status: nextStatus,
      });
      if (res.data?.success) {
        const label = nextStatus === "NEW" ? "New" : nextStatus === "CONTACTED" ? "Contacted" : "Resolved";
        toast.success(`Inquiry marked as ${label}`);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error updating status");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTicket) return;

    try {
      setIsDeleting(true);
      const res = await supportService.deleteTicket(deletingTicket._id);
      if (res.data?.success) {
        toast.success("Inquiry deleted successfully");
        setDeletingTicket(null);
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to delete inquiry");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting inquiry");
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Badge Renderer for modal
  const renderStatusBadge = (status: SupportTicketStatus) => {
    if (status === "NEW") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
          New
        </span>
      );
    }
    if (status === "CONTACTED") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
          Contacted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
        Resolved
      </span>
    );
  };

  // Table Columns
  const columns: ColumnDef<SupportTicket>[] = [
    {
      key: "name",
      label: "SENDER",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-semibold text-xs">
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
              {item.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground truncate">
                {item.email}
              </span>
              {item.phone && (
                <span className="text-[11px] text-muted-foreground">
                  • {item.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "topic",
      label: "TOPIC",
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface text-foreground border border-border/80">
          {item.topic || "General Query"}
        </span>
      ),
    },
    {
      key: "message",
      label: "MESSAGE",
      render: (item) => (
        <div
          onClick={() => handleOpenDetails(item)}
          className="max-w-[280px] lg:max-w-xs cursor-pointer group"
          title="Click to view full inquiry"
        >
          <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors leading-relaxed">
            {item.message}
          </p>
          {item.adminNotes && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
              <RiInformationLine className="h-3 w-3" />
              <span>Has internal note</span>
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      sortable: true,
      align: "center",
      render: (item) => {
        const nextStatusLabel =
          item.status === "NEW"
            ? "Contacted"
            : item.status === "CONTACTED"
            ? "Resolved"
            : "New";

        return (
          <button
            type="button"
            onClick={(e) => handleCycleStatus(item, e)}
            title={`Status: ${item.status}. Click to mark as ${nextStatusLabel}`}
            className="cursor-pointer focus:outline-none inline-block group/btn transition-transform active:scale-95"
          >
            {item.status === "NEW" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs group-hover/btn:bg-blue-500/20 transition-all">
                New
              </span>
            )}
            {item.status === "CONTACTED" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs group-hover/btn:bg-amber-500/20 transition-all">
                Contacted
              </span>
            )}
            {item.status === "RESOLVED" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs group-hover/btn:bg-emerald-500/20 transition-all">
                Resolved
              </span>
            )}
          </button>
        );
      },
    },
    {
      key: "createdAt",
      label: "DATE",
      sortable: true,
      render: (item) => (
        <span
          className="text-xs text-muted-foreground whitespace-nowrap"
          title={formatDateTime(item.createdAt)}
        >
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* View Details */}
          <button
            type="button"
            onClick={() => handleOpenDetails(item)}
            title="View inquiry details"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiEyeLine className="h-4 w-4" />
          </button>

          {/* Quick Email Reply */}
          <a
            href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(
              item.topic || "Your Inquiry on Traders Community"
            )}&body=Hi ${encodeURIComponent(item.name)},%0D%0A%0D%0AThank you for reaching out to Traders Community.%0D%0A%0D%0A`}
            title="Reply via email"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiSendPlaneLine className="h-4 w-4" />
          </a>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setDeletingTicket(item)}
            title="Delete inquiry"
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
        {/* Total Inquiries */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Inquiries
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiCustomerService2Line className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats?.total ?? totalItems}</p>
        </div>

        {/* New */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              New
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <RiInboxLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats?.newCount ?? "—"}</p>
        </div>

        {/* Contacted */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contacted
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RiChatCheckLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats?.contactedCount ?? "—"}</p>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resolved
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <RiCheckboxCircleLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats?.resolvedCount ?? "—"}</p>
        </div>
      </div>

      {/* Main Support Table using Reusable AdminDataTable */}
      <AdminDataTable<SupportTicket>
        title="Support Inquiries"
        subtitle="Review and manage direct queries submitted through the frontend support modal"
        searchPlaceholder="Search by name, email, phone, or message..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        filterActive={statusFilter !== "all" || topicFilter !== "All Topics"}
        filterContent={
          <div className="space-y-4 min-w-[240px]">
            {/* Status Filter */}
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
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
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "All", val: "all" },
                  { label: "New", val: "NEW" },
                  { label: "Contacted", val: "CONTACTED" },
                  { label: "Resolved", val: "RESOLVED" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.val as "all" | SupportTicketStatus);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                      statusFilter === opt.val
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                        : "bg-surface text-muted-foreground hover:text-foreground border border-border/70"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Topic
                </span>
                {topicFilter !== "All Topics" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTopicFilter("All Topics");
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {TOPIC_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setTopicFilter(opt);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                      topicFilter === opt
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <span>{opt}</span>
                    {topicFilter === opt && <RiCheckLine className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={tickets}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No inquiries submitted yet matching your search or filters."
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

      {/* Inquiry Detail & Staff Notes Modal */}
      <AdminModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Inquiry Details"
        subtitle="Review submission details, update resolution status, and manage internal notes"
        size="2xl"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Sender Info Card */}
            <div className="rounded-2xl bg-surface border border-border/70 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {selectedTicket.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{selectedTicket.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedTicket.email}</p>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  {renderStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiPhoneLine className="h-4 w-4 text-primary shrink-0" />
                  <span>Phone: <strong className="text-foreground">{selectedTicket.phone || "Not provided"}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiCalendarLine className="h-4 w-4 text-primary shrink-0" />
                  <span>Received: <strong className="text-foreground">{formatDateTime(selectedTicket.createdAt)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RiInformationLine className="h-4 w-4 text-primary shrink-0" />
                  <span>Topic: <strong className="text-foreground">{selectedTicket.topic}</strong></span>
                </div>
                {selectedTicket.ipAddress && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RiComputerLine className="h-4 w-4 text-primary shrink-0" />
                    <span>IP: <strong className="text-foreground">{selectedTicket.ipAddress}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                User Message
              </label>
              <div className="rounded-2xl bg-card border border-border p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedTicket.message}
              </div>
            </div>

            {/* Direct Email Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-xs space-y-0.5">
                <strong className="text-foreground font-semibold block">Need to reply to {selectedTicket.name}?</strong>
                <span className="text-muted-foreground block text-[11px] sm:text-xs">Send a direct email response using your email app.</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                href={`mailto:${selectedTicket.email}?subject=Re: ${encodeURIComponent(
                  selectedTicket.topic || "Your Inquiry on Traders Community"
                )}&body=Hi ${encodeURIComponent(selectedTicket.name)},%0D%0A%0D%0AThank you for reaching out.%0D%0A%0D%0A`}
                className="shrink-0 text-xs w-full sm:w-auto justify-center"
              >
                <RiSendPlaneLine className="h-3.5 w-3.5" />
                <span>Open Mail</span>
              </Button>
            </div>

            {/* Status Selector & Admin Notes Form */}
            <div className="space-y-4 pt-2 border-t border-border/50">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["NEW", "CONTACTED", "RESOLVED"] as SupportTicketStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center",
                        editStatus === st
                          ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                          : "bg-surface text-muted-foreground hover:text-foreground border-border/80"
                      )}
                    >
                      {st === "NEW" ? "New" : st === "CONTACTED" ? "Contacted" : "Resolved"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Internal Staff Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Connected with the user on phone. Explained course access and sent onboarding link."
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
                className="text-xs w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveTicketUpdates}
                disabled={isUpdating}
                className="text-xs w-full sm:w-auto justify-center"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingTicket)}
        title="Delete Support Inquiry?"
        description={`Are you sure you want to permanently delete the inquiry from ${deletingTicket?.name} (${deletingTicket?.email})? This action cannot be undone.`}
        confirmText="Delete Inquiry"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTicket(null)}
      />
    </div>
  );
}
