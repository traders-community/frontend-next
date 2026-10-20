"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RiChat1Line,
  RiCustomerService2Line,
  RiCheckLine,
  RiTimeLine,
  RiDeleteBinLine,
  RiArticleLine,
  RiEyeLine,
  RiMailLine,
  RiPhoneLine,
  RiExternalLinkLine,
  RiFileCopyLine,
} from "@remixicon/react";
import { DashboardRecentComment, DashboardRecentTicket } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { toast } from "react-toastify";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";

interface DashboardCommentsAndSupportProps {
  comments: DashboardRecentComment[];
  tickets: DashboardRecentTicket[];
  pendingCommentsCount: number;
  openTicketsCount: number;
  isLoading?: boolean;
}

export function DashboardCommentsAndSupport({
  comments = [],
  tickets = [],
  pendingCommentsCount = 0,
  openTicketsCount = 0,
  isLoading = false,
}: DashboardCommentsAndSupportProps) {
  const [localComments, setLocalComments] = useState<DashboardRecentComment[]>(comments);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<DashboardRecentComment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedComment, setSelectedComment] = useState<DashboardRecentComment | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<DashboardRecentTicket | null>(null);

  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleCopy = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`Copied ${label || "text"} to clipboard`);
  };

  const handleApproveComment = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setApprovingId(id);
      const res = await adminService.approveComment(id);
      if (res.data?.success) {
        toast.success(res.data.message || "Comment approved successfully");
        setLocalComments((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, status: "approved", isApproved: true }
              : c
          )
        );
        if (selectedComment?._id === id) {
          setSelectedComment((prev) =>
            prev ? { ...prev, status: "approved", isApproved: true } : null
          );
        }
      } else {
        toast.error(res.data?.message || "Failed to approve comment");
      }
    } catch {
      toast.error("Failed to approve comment");
    } finally {
      setApprovingId(null);
    }
  };

  const handleSetPendingComment = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setPendingId(id);
      const res = await adminService.updateCommentStatus(id, "pending");
      if (res.data?.success) {
        toast.success(res.data.message || "Comment status set to pending");
        setLocalComments((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, status: "pending", isApproved: false }
              : c
          )
        );
        if (selectedComment?._id === id) {
          setSelectedComment((prev) =>
            prev ? { ...prev, status: "pending", isApproved: false } : null
          );
        }
      } else {
        toast.error(res.data?.message || "Failed to update comment status");
      }
    } catch {
      toast.error("Failed to update comment status");
    } finally {
      setPendingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingComment) return;
    try {
      setIsDeleting(true);
      const res = await adminService.deleteComment(deletingComment._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Comment deleted permanently");
        setLocalComments((prev) => prev.filter((c) => c._id !== deletingComment._id));
        if (selectedComment?._id === deletingComment._id) {
          setSelectedComment(null);
        }
        setDeletingComment(null);
      } else {
        toast.error(res.data?.message || "Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Comments Columns ---
  const commentColumns: ColumnDef<DashboardRecentComment>[] = [
    {
      key: "name",
      label: "User",
      className: "w-28 sm:w-32",
      render: (c) => (
        <div className="min-w-0">
          <span className="font-semibold text-foreground text-xs block truncate max-w-[120px]">
            {c.name || "Anonymous"}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
            {formatDate(c.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: "content",
      label: "Comment & Blog",
      render: (c) => {
        const blogTitle =
          typeof c.blog === "object" && c.blog !== null && "title" in c.blog
            ? c.blog.title
            : undefined;

        return (
          <div className="min-w-0 max-w-[210px] sm:max-w-[260px] space-y-1">
            <p
              className="text-xs font-medium text-foreground line-clamp-1 leading-snug"
              title={c.content}
            >
              {c.content}
            </p>
            {blogTitle ? (
              <div
                className="flex items-center gap-1.5 min-w-0 text-[11px] text-muted-foreground/85"
                title={blogTitle}
              >
                <RiArticleLine className="size-3 text-muted-foreground/70 shrink-0" />
                <span className="truncate hover:text-foreground transition-colors">
                  {blogTitle}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60 italic">
                General comment
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      className: "w-20 sm:w-24",
      render: (c) => {
        const isPending =
          c.status === "pending" || c.status === "unapproved" || !c.isApproved;
        return (
          <span
            className={cn(
              "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border",
              isPending
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            )}
          >
            {isPending ? "Pending" : "Approved"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      className: "w-24 text-right",
      render: (c) => {
        const isApproved = c.isApproved || c.status === "approved";
        const isPending =
          c.status === "pending" || c.status === "unapproved" || !c.isApproved;
        const isBusy = approvingId === c._id || pendingId === c._id;

        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Green Checkmark - Approve */}
            <button
              type="button"
              disabled={isBusy}
              onClick={(e) => {
                if (isApproved) {
                  toast.info("Comment is already approved");
                  return;
                }
                handleApproveComment(c._id, e);
              }}
              title={isApproved ? "Approved" : "Approve comment"}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                isApproved
                  ? "text-emerald-500/35 hover:text-emerald-500"
                  : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10"
              )}
            >
              <RiCheckLine className="size-4" />
            </button>

            {/* 2. Yellow Clock - Set to Pending */}
            <button
              type="button"
              disabled={isBusy}
              onClick={(e) => {
                if (isPending && c.status === "pending") {
                  toast.info("Comment is already pending");
                  return;
                }
                handleSetPendingComment(c._id, e);
              }}
              title={isPending ? "Pending moderation" : "Reset to Pending"}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                isPending
                  ? "text-amber-500/40 hover:text-amber-500"
                  : "text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-500/10"
              )}
            >
              <RiTimeLine className="size-4" />
            </button>

            {/* 3. Gray Trash - Delete Permanently */}
            <button
              type="button"
              disabled={isBusy}
              onClick={(e) => {
                e.stopPropagation();
                setDeletingComment(c);
              }}
              title="Delete comment permanently"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <RiDeleteBinLine className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // --- Support Tickets Columns ---
  const ticketColumns: ColumnDef<DashboardRecentTicket>[] = [
    {
      key: "name",
      label: "Contact",
      render: (t) => (
        <div className="min-w-0">
          <span className="font-semibold text-foreground text-xs block truncate max-w-[120px]">
            {t.name}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
            {formatDate(t.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: "topic",
      label: "Topic & Inquiry",
      render: (t) => (
        <div className="min-w-0 max-w-[210px] sm:max-w-xs">
          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-surface border border-border/70 text-foreground">
            {t.topic || "General Inquiry"}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={t.message}>
            {t.message}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (t) => {
        const isNew = t.status === "NEW";
        const isResolved = t.status === "RESOLVED";

        return (
          <span
            className={cn(
              "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border",
              isNew
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                : isResolved
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
            )}
          >
            {t.status || "NEW"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (t) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSelectedTicket(t)}
            title="View Inquiry"
            className="p-1.5 rounded-lg border border-border/60 hover:border-primary/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <RiEyeLine className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left 50%: Comments Table */}
        <AdminDataTable<DashboardRecentComment>
          variant="card"
          icon={RiChat1Line}
          title="Comments"
          subtitle={
            pendingCommentsCount > 0 ? (
              <span className="text-amber-500 font-semibold">
                {pendingCommentsCount} awaiting approval
              </span>
            ) : (
              <span>All comments approved</span>
            )
          }
          actionButton={{
            label: "View All",
            href: "/admin/comments",
          }}
          columns={commentColumns}
          data={localComments}
          keyExtractor={(c) => c._id}
          isLoading={isLoading}
          emptyMessage="No comments found."
          onRowClick={(c) => setSelectedComment(c)}
        />

        {/* Right 50%: Support Tickets Table */}
        <AdminDataTable<DashboardRecentTicket>
          variant="card"
          icon={RiCustomerService2Line}
          title="Support Tickets"
          subtitle={
            openTicketsCount > 0 ? (
              <span className="text-blue-500 font-semibold">
                {openTicketsCount} new inquir{openTicketsCount === 1 ? "y" : "ies"}
              </span>
            ) : (
              <span>All inquiries handled</span>
            )
          }
          actionButton={{
            label: "View All",
            href: "/admin/support",
          }}
          columns={ticketColumns}
          data={tickets}
          keyExtractor={(t) => t._id}
          isLoading={isLoading}
          emptyMessage="No active support tickets."
          onRowClick={(t) => setSelectedTicket(t)}
        />
      </div>

      {/* Comment Details Modal */}
      {selectedComment && (
        <AdminModal
          isOpen={!!selectedComment}
          onClose={() => setSelectedComment(null)}
          title="Comment Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {selectedComment.name || "Anonymous Commenter"}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {formatDate(selectedComment.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-semibold border",
                  selectedComment.status === "pending" ||
                    selectedComment.status === "unapproved" ||
                    !selectedComment.isApproved
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                )}
              >
                {selectedComment.status === "pending" ||
                selectedComment.status === "unapproved" ||
                !selectedComment.isApproved
                  ? "Pending Moderation"
                  : "Approved"}
              </span>
            </div>

            {(() => {
              const selectedBlogTitle =
                typeof selectedComment.blog === "object" &&
                selectedComment.blog !== null &&
                "title" in selectedComment.blog
                  ? selectedComment.blog.title
                  : undefined;

              return (
                selectedBlogTitle && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface/50 p-2.5 rounded-lg border border-border/60">
                    <RiArticleLine className="size-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">
                      Blog: <span className="font-semibold text-foreground">{selectedBlogTitle}</span>
                    </span>
                  </div>
                )
              );
            })()}

            <div className="p-4 rounded-xl bg-surface border border-border/70 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedComment.content}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  const target = selectedComment;
                  setSelectedComment(null);
                  setDeletingComment(target);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <RiDeleteBinLine className="size-4" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
                >
                  Close
                </button>
                {selectedComment.status === "pending" ||
                selectedComment.status === "unapproved" ||
                !selectedComment.isApproved ? (
                  <button
                    type="button"
                    disabled={approvingId === selectedComment._id}
                    onClick={() => handleApproveComment(selectedComment._id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <RiCheckLine className="size-4" />
                    <span>
                      {approvingId === selectedComment._id ? "Approving..." : "Approve Comment"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pendingId === selectedComment._id}
                    onClick={() => handleSetPendingComment(selectedComment._id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <RiTimeLine className="size-4" />
                    <span>
                      {pendingId === selectedComment._id ? "Resetting..." : "Reset to Pending"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Comment Confirmation Modal */}
      {deletingComment && (
        <ConfirmationModal
          isOpen={!!deletingComment}
          title="Delete Comment"
          description={`Are you sure you want to permanently delete the comment by "${
            deletingComment.name || "Anonymous"
          }"? This action cannot be undone.`}
          confirmText="Delete Comment"
          cancelText="Cancel"
          confirmVariant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingComment(null)}
        />
      )}

      {/* Support Ticket Details Modal */}
      {selectedTicket && (
        <AdminModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Support Ticket Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {selectedTicket.name}
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-semibold border",
                  selectedTicket.status === "NEW"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    : selectedTicket.status === "RESOLVED"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                )}
              >
                {selectedTicket.status || "NEW"}
              </span>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedTicket.email && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border/60">
                  <div className="flex items-center gap-2 truncate">
                    <RiMailLine className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{selectedTicket.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTicket.email, "email")}
                    className="p-1 hover:text-primary transition-colors cursor-pointer shrink-0"
                    title="Copy Email"
                  >
                    <RiFileCopyLine className="size-3.5" />
                  </button>
                </div>
              )}
              {selectedTicket.phone && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-border/60">
                  <div className="flex items-center gap-2 truncate">
                    <RiPhoneLine className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{selectedTicket.phone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTicket.phone, "phone")}
                    className="p-1 hover:text-primary transition-colors cursor-pointer shrink-0"
                    title="Copy Phone"
                  >
                    <RiFileCopyLine className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Topic */}
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                Topic
              </span>
              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-surface border border-border/80 text-foreground">
                {selectedTicket.topic || "General"}
              </span>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                Inquiry Message
              </span>
              <div className="p-3.5 rounded-xl bg-surface border border-border/70 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedTicket.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/admin/support"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-black hover:bg-primary-hover shadow-xs transition-colors"
              >
                <RiExternalLinkLine className="size-3.5" />
                <span>Open in Support Portal</span>
              </Link>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  );
}
