"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  RiMailSendLine,
  RiCheckLine,
  RiTimeLine,
  RiAlertFill,
  RiCheckboxCircleLine,
  RiCursorLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiPercentLine,
  RiArticleLine,
  RiFilterLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
} from "@remixicon/react";
import { newsletterService } from "@/services/newsletter.service";
import { NewsletterCampaign, NewsletterStats, CampaignType, CampaignStatus } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

export default function AdminNewsletterHistoryPage() {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Sorting
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected Campaign Details Modal
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Click Engagement Log Sub-Pagination & Search State inside Modal
  const [logPage, setLogPage] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const LOGS_PER_PAGE = 5;

  // Fetch campaigns
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [campRes, statsRes] = await Promise.all([
        newsletterService.getCampaigns({
          page: currentPage,
          limit: pageSize,
          type: typeFilter === "all" ? undefined : typeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
          sort: sortKey || undefined,
          order: sortDirection || undefined,
        }),
        newsletterService.getStats().catch(() => null),
      ]);

      if (campRes.data?.success) {
        setCampaigns(campRes.data.campaigns || []);
        setTotalPages(campRes.data.totalPages || 1);
        setTotalItems(campRes.data.total || 0);
      } else {
        toast.error(campRes.data?.message || "Failed to load campaign history");
      }

      if (statsRes?.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching history");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, typeFilter, statusFilter, search, sortKey, sortDirection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered & Paginated Click Logs inside Modal
  const filteredClickLogs = useMemo(() => {
    if (!selectedCampaign?.clickedSubscribers) return [];
    const query = logSearch.trim().toLowerCase();
    if (!query) return selectedCampaign.clickedSubscribers;
    return selectedCampaign.clickedSubscribers.filter((log) => {
      const email = log.subscriber?.email?.toLowerCase() || "";
      const name = log.subscriber?.name?.toLowerCase() || "";
      return email.includes(query) || name.includes(query);
    });
  }, [selectedCampaign, logSearch]);

  const totalLogPages = Math.max(1, Math.ceil(filteredClickLogs.length / LOGS_PER_PAGE));
  const paginatedClickLogs = useMemo(() => {
    const start = (logPage - 1) * LOGS_PER_PAGE;
    return filteredClickLogs.slice(start, start + LOGS_PER_PAGE);
  }, [filteredClickLogs, logPage]);

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

  // Open Campaign Details Modal with fresh data
  const handleOpenDetails = async (campaign: NewsletterCampaign) => {
    setSelectedCampaign(campaign);
    setLogPage(1);
    setLogSearch("");
    setDetailsLoading(true);
    try {
      const res = await newsletterService.getCampaignDetails(campaign._id);
      if (res.data?.success && res.data.campaign) {
        setSelectedCampaign(res.data.campaign);
      }
    } catch {
      // Fallback to existing campaign state
    } finally {
      setDetailsLoading(false);
    }
  };

  // Status badge helper
  const renderStatusBadge = (status: CampaignStatus) => {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15">
          <RiCheckboxCircleLine className="h-3.5 w-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (status === "processing") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 dark:bg-amber-500/15">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <span>In Progress</span>
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 dark:bg-red-500/15">
          <RiAlertFill className="h-3.5 w-3.5" />
          <span>Failed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
        <span>Draft</span>
      </span>
    );
  };

  // Type label helper
  const renderTypeBadge = (type: CampaignType) => {
    if (type === "blog_publish") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/15 text-primary">
          <RiArticleLine className="h-3 w-3" />
          <span>Blog Publish</span>
        </span>
      );
    }
    if (type === "welcome") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/15 text-blue-500">
          <span>Welcome Email</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/15 text-purple-500">
        <span>Broadcast</span>
      </span>
    );
  };

  // Columns definition
  const columns: ColumnDef<NewsletterCampaign>[] = [
    {
      key: "title",
      label: "Campaign / Subject",
      sortable: true,
      render: (item) => (
        <div className="space-y-1 max-w-xs sm:max-w-md">
          <div className="flex items-center gap-2">
            {renderTypeBadge(item.type)}
            {item.blog?.category && (
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                • {item.blog.category}
              </span>
            )}
          </div>
          <p className="font-semibold text-foreground text-xs sm:text-sm line-clamp-1">
            {item.title}
          </p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {item.subject}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => renderStatusBadge(item.status),
    },
    {
      key: "totalSubscribers",
      label: "Batch Delivery",
      sortable: true,
      render: (item) => {
        const total = item.totalSubscribers || 0;
        const sent = item.sentCount || 0;
        const failed = item.failedCount || 0;
        const pending = item.pendingCount || 0;
        const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

        return (
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                {sent} <span className="font-normal text-muted-foreground">/ {total}</span>
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">{pct}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
              {failed > 0 && total > 0 && (
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${(failed / total) * 100}%` }}
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="text-emerald-500">{sent} sent</span>
              {pending > 0 && <span>• {pending} pending</span>}
              {failed > 0 && <span className="text-red-500">• {failed} failed</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "clicksCount",
      label: "Clicks & CTR",
      sortable: true,
      render: (item) => {
        const clicks = item.clicksCount || 0;
        const uniqueClicks = item.uniqueClicksCount || 0;
        const sent = item.sentCount || 0;
        const ctr = sent > 0 ? ((uniqueClicks / sent) * 100).toFixed(1) : "0.0";

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <RiCursorLine className="h-3.5 w-3.5 text-primary" />
              <span>{uniqueClicks} unique</span>
              <span className="text-[11px] text-muted-foreground font-normal">({clicks} total)</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border text-foreground">
              <RiPercentLine className="h-3 w-3 text-primary" />
              <span>{ctr}% CTR</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Sent Date & Time",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(item.sentAt || item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleOpenDetails(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-surface-hover text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs"
            title="View campaign breakdown"
          >
            <RiEyeLine className="h-3.5 w-3.5 text-primary" />
            <span>Details</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Campaigns */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campaigns
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiMailSendLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.totalCampaigns ?? totalItems}
          </p>
        </div>

        {/* Total Emails Delivered */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Delivered Emails
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <RiCheckboxCircleLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.totalEmailsSent ?? campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0)}
          </p>
        </div>

        {/* Total Tracked Clicks */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tracked Clicks
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <RiCursorLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.totalClicks ?? campaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0)}
          </p>
        </div>

        {/* Avg Click Rate */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg CTR
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiPercentLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.avgClickRate ?? 0}%
          </p>
        </div>
      </div>

      {/* Main Table */}
      <AdminDataTable
        title="Email Sent History"
        subtitle="Historical delivery reports, batch counters, and engagement metrics for all newsletter campaigns"
        searchPlaceholder="Search campaign title or subject..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        filterActive={typeFilter !== "all" || statusFilter !== "all"}
        filterContent={
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold text-foreground">Filters</span>
              {(typeFilter !== "all" || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Campaign Type
              </span>
              <div className="space-y-1">
                {[
                  { label: "All Types", val: "all" },
                  { label: "Blog Publish Alert", val: "blog_publish" },
                  { label: "Welcome Email", val: "welcome" },
                  { label: "Broadcast", val: "custom" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setTypeFilter(opt.val);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                      typeFilter === opt.val
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <span>{opt.label}</span>
                    {typeFilter === opt.val && <RiCheckLine className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </span>
              <div className="space-y-1">
                {[
                  { label: "All Statuses", val: "all" },
                  { label: "Completed", val: "completed" },
                  { label: "In Progress", val: "processing" },
                  { label: "Failed", val: "failed" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.val);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                      statusFilter === opt.val
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.val && <RiCheckLine className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        columns={columns}
        data={campaigns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No campaign history found matching your filters."
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

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <AdminModal
          isOpen={Boolean(selectedCampaign)}
          onClose={() => setSelectedCampaign(null)}
          title="Campaign Report"
          subtitle={selectedCampaign.title}
          size="2xl"
        >
          <div className="space-y-5 sm:space-y-6">
            {/* Top Status & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/80 bg-surface/30">
              <div className="flex items-center gap-2 flex-wrap">
                {renderStatusBadge(selectedCampaign.status)}
                {renderTypeBadge(selectedCampaign.type)}
              </div>
              <span className="text-xs text-muted-foreground">
                Dispatched: {formatDateTime(selectedCampaign.sentAt || selectedCampaign.createdAt)}
              </span>
            </div>

            {/* Subject Line & Linked Blog */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Email Subject Line
                </span>
                <p className="text-xs sm:text-sm font-semibold text-foreground p-3 rounded-xl border border-border/80 bg-card break-words">
                  {selectedCampaign.subject}
                </p>
              </div>

              {selectedCampaign.blog && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Linked Research Article
                  </span>
                  <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {selectedCampaign.blog.image && (
                        <img
                          src={selectedCampaign.blog.image}
                          alt=""
                          className="h-12 w-16 sm:h-10 sm:w-14 rounded-lg object-cover border border-border/60 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 sm:line-clamp-1">
                          {selectedCampaign.blog.title}
                        </p>
                        {selectedCampaign.blog.category && (
                          <span className="text-[11px] text-muted-foreground block mt-0.5">
                            Category: {selectedCampaign.blog.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/blog/${selectedCampaign.blog.slug || selectedCampaign.blog._id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-xs font-semibold text-foreground transition-colors shrink-0 w-full sm:w-auto text-center"
                    >
                      <span>View Blog</span>
                      <RiExternalLinkLine className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Breakdown Grid */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Delivery & Engagement Numbers
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card text-center space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground block truncate">
                    Recipients
                  </span>
                  <p className="text-base sm:text-lg font-bold text-foreground">
                    {selectedCampaign.totalSubscribers || 0}
                  </p>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card text-center space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-500 block truncate">
                    Delivered
                  </span>
                  <p className="text-base sm:text-lg font-bold text-emerald-500">
                    {selectedCampaign.sentCount || 0}
                  </p>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card text-center space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-blue-500 block truncate">
                    Unique Clickers
                  </span>
                  <p className="text-base sm:text-lg font-bold text-blue-500">
                    {selectedCampaign.uniqueClicksCount || 0}
                  </p>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card text-center space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-primary block truncate">
                    Click Rate
                  </span>
                  <p className="text-base sm:text-lg font-bold text-primary">
                    {selectedCampaign.sentCount > 0
                      ? (
                          (selectedCampaign.uniqueClicksCount / selectedCampaign.sentCount) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Clicked Subscribers Log with Search & Pagination */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Click Engagement Log ({filteredClickLogs.length}{" "}
                    {filteredClickLogs.length !== (selectedCampaign.clickedSubscribers?.length || 0) &&
                      `/ ${selectedCampaign.clickedSubscribers?.length || 0}`}
                    )
                  </span>
                  {filteredClickLogs.length > 0 && (
                    <span className="text-[10px] text-muted-foreground sm:hidden block">
                      Swipe horizontally to view complete details
                    </span>
                  )}
                </div>

                {/* Sub-search for clicked emails if more than 3 logs */}
                {(selectedCampaign.clickedSubscribers?.length || 0) > 3 && (
                  <div className="relative flex items-center w-full sm:w-auto">
                    <RiSearchLine className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => {
                        setLogSearch(e.target.value);
                        setLogPage(1);
                      }}
                      placeholder="Filter clicks..."
                      className="pl-8 pr-2.5 py-1.5 sm:py-1 text-xs bg-surface border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 w-full sm:w-44"
                    />
                  </div>
                )}
              </div>

              {filteredClickLogs.length === 0 ? (
                <div className="py-6 px-4 rounded-xl border border-dashed border-border/80 text-center bg-surface/20">
                  <p className="text-xs text-muted-foreground">
                    {logSearch.trim()
                      ? "No clicks matching your search filter."
                      : "No tracked clicks recorded for this campaign yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-full rounded-xl border border-border/80 overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[460px]">
                      <thead className="bg-surface border-b border-border text-muted-foreground">
                        <tr>
                          <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                            Subscriber Email
                          </th>
                          <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[10px] text-right whitespace-nowrap">
                            Clicked Date & Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-card">
                        {paginatedClickLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-surface-hover/50 transition-colors">
                            <td className="px-3.5 py-2.5 text-foreground font-medium whitespace-nowrap">
                              <span>{log.subscriber?.email || "Subscriber"}</span>
                              {log.subscriber?.name && log.subscriber.name !== "Trader" && (
                                <span className="text-[11px] text-muted-foreground ml-1.5 font-normal">
                                  ({log.subscriber.name})
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-muted-foreground text-right whitespace-nowrap text-[10px] sm:text-[11px] font-medium">
                              {formatDateTime(log.clickedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sub-pagination Footer for Click Logs */}
                  {totalLogPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-xs text-muted-foreground pt-1">
                      <span className="text-[11px]">
                        Showing {(logPage - 1) * LOGS_PER_PAGE + 1}–
                        {Math.min(logPage * LOGS_PER_PAGE, filteredClickLogs.length)} of{" "}
                        {filteredClickLogs.length}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                          disabled={logPage === 1}
                          className="p-1 rounded-lg border border-border bg-card hover:bg-surface text-foreground transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          title="Previous page"
                        >
                          <RiArrowLeftSLine className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[11px] font-semibold text-foreground px-1">
                          {logPage} / {totalLogPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                          disabled={logPage === totalLogPages}
                          className="p-1 rounded-lg border border-border bg-card hover:bg-surface text-foreground transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          title="Next page"
                        >
                          <RiArrowRightSLine className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedCampaign.errorMessage && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs">
                <strong>Error details:</strong> {selectedCampaign.errorMessage}
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </div>
  );
}
