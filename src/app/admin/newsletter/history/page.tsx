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
  RiCloseLine,
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

  // Click Engagement & Delivery Activity Sub-Pagination & Search State inside Modal
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(5);
  const [logSearch, setLogSearch] = useState("");

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

  // Enhanced Click Logs with Batch Assignment & Scalable Filtering
  const allClickLogsWithBatch = useMemo(() => {
    if (!selectedCampaign?.clickedSubscribers) return [];
    return selectedCampaign.clickedSubscribers.map((log, index) => ({
      ...log,
      batchNumber: Math.floor(index / 25) + 1,
    }));
  }, [selectedCampaign]);

  const filteredClickLogs = useMemo(() => {
    const query = logSearch.trim().toLowerCase();
    if (!query) return allClickLogsWithBatch;
    return allClickLogsWithBatch.filter((log) => {
      const email = log.subscriber?.email?.toLowerCase() || "";
      const name = log.subscriber?.name?.toLowerCase() || "";
      const batchStr = `batch ${log.batchNumber}`.toLowerCase();
      const batchNum = `${log.batchNumber}`;
      return (
        email.includes(query) ||
        name.includes(query) ||
        batchStr.includes(query) ||
        batchNum === query
      );
    });
  }, [allClickLogsWithBatch, logSearch]);

  const totalLogPages = Math.max(1, Math.ceil(filteredClickLogs.length / logPageSize));
  const paginatedClickLogs = useMemo(() => {
    const start = (logPage - 1) * logPageSize;
    return filteredClickLogs.slice(start, start + logPageSize);
  }, [filteredClickLogs, logPage, logPageSize]);

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Completed
        </span>
      );
    }
    if (status === "processing") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          In Progress
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60">
        Draft
      </span>
    );
  };

  // Type label helper
  const renderTypeBadge = (type: CampaignType) => {
    if (type === "blog_publish") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
          <RiArticleLine className="h-3 w-3" />
          <span>Blog Alert</span>
        </span>
      );
    }
    if (type === "welcome") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span>Welcome</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
        <span>Broadcast</span>
      </span>
    );
  };

  // Helper to split date & time for clean 2-line display
  const renderDateTimeCell = (dateInput?: string | number | Date) => {
    if (!dateInput) return <span className="text-xs text-muted-foreground">—</span>;
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return <span className="text-xs text-muted-foreground">—</span>;
      const dateStr = new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
      const timeStr = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d);

      return (
        <div className="space-y-0.5 whitespace-nowrap">
          <p className="text-xs font-medium text-foreground">{dateStr}</p>
          <p className="text-[11px] text-muted-foreground">{timeStr}</p>
        </div>
      );
    } catch {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
  };

  // Columns definition
  const columns: ColumnDef<NewsletterCampaign>[] = [
    {
      key: "title",
      label: "Campaign",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-sm md:max-w-md">
          {/* Thumbnail / Icon */}
          <div className="w-12 h-9 rounded-lg overflow-hidden bg-surface border border-border/70 shrink-0 flex items-center justify-center">
            {item.blog?.image ? (
              <img
                src={item.blog.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                {item.type === "blog_publish" ? (
                  <RiArticleLine className="h-4 w-4" />
                ) : (
                  <RiMailSendLine className="h-4 w-4" />
                )}
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <p
              onClick={() => handleOpenDetails(item)}
              className="font-semibold text-foreground text-xs sm:text-sm truncate hover:text-primary transition-colors cursor-pointer leading-snug"
              title={item.title}
            >
              {item.title}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 truncate">
              <span className="font-medium text-foreground/80">
                {item.type === "blog_publish"
                  ? "Blog Alert"
                  : item.type === "welcome"
                  ? "Welcome Email"
                  : "Broadcast"}
              </span>
              {item.blog?.category && (
                <>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground">{item.blog.category}</span>
                </>
              )}
            </div>
          </div>
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
        const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

        return (
          <div className="space-y-1.5 min-w-[120px] max-w-[160px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {sent}{" "}
                <span className="font-normal text-muted-foreground text-[11px]">/ {total}</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">{pct}%</span>
            </div>
            {/* Elegant Slim Progress Bar */}
            <div className="h-1.5 w-full bg-surface border border-border/60 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
              {failed > 0 && total > 0 && (
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${(failed / total) * 100}%` }}
                />
              )}
            </div>
            {failed > 0 && (
              <span className="text-[10px] font-medium text-rose-500 block">
                {failed} failed
              </span>
            )}
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
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <RiCursorLine className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {uniqueClicks} {uniqueClicks === 1 ? "click" : "clicks"}
              </span>
              {clicks > uniqueClicks && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  ({clicks} total)
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-primary pl-5">
              {ctr}% CTR
            </p>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Sent Date & Time",
      sortable: true,
      render: (item) => renderDateTimeCell(item.sentAt || item.createdAt),
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-surface-hover hover:border-border text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs group"
            title="View campaign breakdown"
          >
            <RiEyeLine className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
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
          title="Campaign Details"
          subtitle={selectedCampaign.title}
          size="2xl"
        >
          <div className="space-y-5">
            {/* Top Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border/50">
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedCampaign.status)}
                {renderTypeBadge(selectedCampaign.type)}
              </div>
              <span className="text-xs text-muted-foreground">
                Dispatched {formatDateTime(selectedCampaign.sentAt || selectedCampaign.createdAt)}
              </span>
            </div>

            {/* Campaign / Email Info Card */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 space-y-3">
              {selectedCampaign.blog ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedCampaign.blog.image && (
                      <img
                        src={selectedCampaign.blog.image}
                        alt=""
                        className="h-11 w-14 rounded-lg object-cover border border-border/60 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {selectedCampaign.blog.title}
                      </p>
                      {selectedCampaign.blog.category && (
                        <p className="text-[11px] text-muted-foreground">
                          {selectedCampaign.blog.category}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/blog/${selectedCampaign.blog.slug || selectedCampaign.blog._id}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border/70 text-xs font-medium text-foreground transition-colors shrink-0 self-start sm:self-center"
                  >
                    <span>View Blog</span>
                    <RiExternalLinkLine className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </div>
              ) : null}

              {/* Subject line */}
              <div className="pt-1 border-t border-border/40">
                <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">
                  Subject
                </span>
                <p className="text-xs sm:text-sm font-medium text-foreground break-words">
                  {selectedCampaign.subject}
                </p>
              </div>
            </div>

            {/* Unified Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-surface/30">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Recipients</span>
                <p className="text-base sm:text-lg font-bold text-foreground">
                  {selectedCampaign.totalSubscribers || 0}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Delivered</span>
                <p className="text-base sm:text-lg font-bold text-emerald-500">
                  {selectedCampaign.sentCount || 0}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Unique Clicks</span>
                <p className="text-base sm:text-lg font-bold text-blue-400">
                  {selectedCampaign.uniqueClicksCount || 0}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Click Rate</span>
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

            {/* Delivery & Engagement Activity Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Engagement & Delivery Activity
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border/70 text-muted-foreground">
                    {filteredClickLogs.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative flex items-center flex-1 sm:w-48">
                    <RiSearchLine className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => {
                        setLogSearch(e.target.value);
                        setLogPage(1);
                      }}
                      placeholder="Search email, batch..."
                      className="pl-8 pr-7 py-1 text-xs bg-surface border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 w-full"
                    />
                    {logSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setLogSearch("");
                          setLogPage(1);
                        }}
                        className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Clear search"
                      >
                        <RiCloseLine className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Page Size Selector */}
                  <select
                    value={logPageSize}
                    onChange={(e) => {
                      setLogPageSize(Number(e.target.value));
                      setLogPage(1);
                    }}
                    className="py-1 px-2 text-[11px] font-medium bg-surface border border-border/70 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                    title="Items per page"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                  </select>
                </div>
              </div>

              {filteredClickLogs.length === 0 ? (
                <div className="py-6 px-4 rounded-xl border border-dashed border-border/70 text-center bg-surface/20">
                  <p className="text-xs text-muted-foreground">
                    {logSearch.trim()
                      ? `No records found matching "${logSearch}".`
                      : "No tracked activity recorded for this campaign yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="w-full rounded-xl border border-border/70 overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[480px]">
                      <thead className="bg-surface/60 border-b border-border/70 text-muted-foreground">
                        <tr>
                          <th className="px-3.5 py-2 font-semibold text-[10px] uppercase tracking-wider w-24">
                            Batch #
                          </th>
                          <th className="px-3.5 py-2 font-semibold text-[10px] uppercase tracking-wider">
                            Recipient
                          </th>
                          <th className="px-3.5 py-2 font-semibold text-[10px] uppercase tracking-wider text-center w-28">
                            Status
                          </th>
                          <th className="px-3.5 py-2 font-semibold text-[10px] uppercase tracking-wider text-right whitespace-nowrap">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50 bg-card/40">
                        {paginatedClickLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-surface/40 transition-colors">
                            {/* Batch Column */}
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface border border-border/80 text-muted-foreground">
                                Batch #{log.batchNumber}
                              </span>
                            </td>

                            {/* Recipient Column */}
                            <td className="px-3.5 py-2.5 text-foreground whitespace-nowrap min-w-0">
                              <span className="font-medium">{log.subscriber?.email || "Subscriber"}</span>
                              {log.subscriber?.name && log.subscriber.name !== "Trader" && (
                                <span className="text-[11px] text-muted-foreground ml-1.5 font-normal">
                                  ({log.subscriber.name})
                                </span>
                              )}
                            </td>

                            {/* Status Column */}
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Clicked
                              </span>
                            </td>

                            {/* Timestamp Column */}
                            <td className="px-3.5 py-2.5 text-muted-foreground text-right whitespace-nowrap text-[11px]">
                              {formatDateTime(log.clickedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Scalable Pagination Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-xs text-muted-foreground pt-1">
                    <span className="text-[11px]">
                      Showing {(logPage - 1) * logPageSize + 1}–
                      {Math.min(logPage * logPageSize, filteredClickLogs.length)} of{" "}
                      {filteredClickLogs.length} records
                    </span>

                    {totalLogPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                          disabled={logPage === 1}
                          className="px-2 py-1 rounded-lg border border-border bg-card hover:bg-surface text-foreground transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                          title="Previous page"
                        >
                          <RiArrowLeftSLine className="h-3.5 w-3.5 inline mr-0.5" />
                          <span>Prev</span>
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalLogPages }, (_, idx) => idx + 1)
                          .filter(
                            (p) =>
                              p === 1 ||
                              p === totalLogPages ||
                              (p >= logPage - 1 && p <= logPage + 1)
                          )
                          .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                              {idx > 0 && arr[idx - 1] !== p - 1 && (
                                <span className="px-1 text-muted-foreground text-[10px]">...</span>
                              )}
                              <button
                                type="button"
                                onClick={() => setLogPage(p)}
                                className={cn(
                                  "h-7 min-w-7 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                                  logPage === p
                                    ? "bg-primary text-black"
                                    : "border border-border bg-card hover:bg-surface text-foreground"
                                )}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          ))}

                        <button
                          type="button"
                          onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
                          disabled={logPage === totalLogPages}
                          className="px-2 py-1 rounded-lg border border-border bg-card hover:bg-surface text-foreground transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-[11px]"
                          title="Next page"
                        >
                          <span>Next</span>
                          <RiArrowRightSLine className="h-3.5 w-3.5 inline ml-0.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedCampaign.errorMessage && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs">
                <strong>Error:</strong> {selectedCampaign.errorMessage}
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </div>
  );
}
