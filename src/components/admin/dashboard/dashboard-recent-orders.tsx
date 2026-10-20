"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardRecentOrder } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import {
  RiShoppingBag3Line,
  RiEyeLine,
  RiFileCopyLine,
  RiExternalLinkLine,
} from "@remixicon/react";
import { toast } from "react-toastify";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";

interface DashboardRecentOrdersProps {
  orders: DashboardRecentOrder[];
  isLoading?: boolean;
}

export function DashboardRecentOrders({
  orders = [],
  isLoading = false,
}: DashboardRecentOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<DashboardRecentOrder | null>(null);

  const handleCopy = (text?: string, label?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`Copied ${label || "text"} to clipboard`);
  };

  const columns: ColumnDef<DashboardRecentOrder>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (order) => {
        const orderNum = order.orderNumber || order.orderId || "";
        return (
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
              <span>{orderNum}</span>
              {orderNum && (
                <button
                  type="button"
                  onClick={(e) => handleCopy(orderNum, "Order ID", e)}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  <RiFileCopyLine className="size-3" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
              {formatDate(order.createdAt)}
            </span>
          </div>
        );
      },
    },
    {
      key: "customer",
      label: "Customer",
      render: (order) => {
        const customerName =
          order.customerName ||
          [order.firstName, order.lastName].filter(Boolean).join(" ") ||
          "Customer";
        const email = order.email || order.customerEmail || "";
        return (
          <div className="min-w-0 max-w-[200px]">
            <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
              {customerName}
            </span>
            {email && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate">
                <span className="truncate">{email}</span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(email, "email", e)}
                  className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                  title="Copy email"
                >
                  <RiFileCopyLine className="size-3" />
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "productTitle",
      label: "Plan / Product",
      render: (order) => {
        const planDuration = order.planDuration || order.variationTitle || "1 Month";
        return (
          <div>
            <span className="font-medium text-foreground text-xs block truncate max-w-[190px]">
              {order.productTitle || "Telegram Access"}
            </span>
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-semibold bg-surface border border-border/70 text-foreground font-mono">
              {planDuration}
            </span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (order) => (
        <div>
          <span className="font-bold text-foreground text-xs sm:text-sm block font-mono">
            ₹{order.amount?.toLocaleString("en-IN") || 0}
          </span>
          <span
            className={cn(
              "inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase border",
              order.paymentStatus === "PAID"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
            )}
          >
            {order.paymentStatus || "PAID"}
          </span>
        </div>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Subscription",
      align: "center",
      render: (order) => (
        <span
          className={cn(
            "inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border",
            order.subscriptionStatus === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {order.subscriptionStatus || "ACTIVE"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Quick Access",
      align: "right",
      render: (order) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSelectedOrder(order)}
            title="View Order Details"
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
      <AdminDataTable<DashboardRecentOrder>
        variant="card"
        icon={RiShoppingBag3Line}
        title="Recent Orders"
        subtitle="Latest customer subscription transactions across your community"
        actionButton={{
          label: "View All Orders",
          href: "/admin/orders",
        }}
        columns={columns}
        data={orders}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        emptyMessage="No recent orders found."
        onRowClick={(item) => setSelectedOrder(item)}
      />

      {/* Order Details Modal Popup */}
      {selectedOrder && (
        <AdminModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
          size="lg"
        >
          <div className="space-y-5">
            {(() => {
              const orderNum = selectedOrder.orderNumber || selectedOrder.orderId || "";
              const customerName =
                selectedOrder.customerName ||
                [selectedOrder.firstName, selectedOrder.lastName].filter(Boolean).join(" ") ||
                "—";
              const email = selectedOrder.email || selectedOrder.customerEmail || "";
              const phone = selectedOrder.phoneNumber || selectedOrder.customerPhone || "";
              const planDuration =
                selectedOrder.planDuration || selectedOrder.variationTitle || "1 Month";
              const paymentId =
                selectedOrder.razorpayPaymentId || selectedOrder.gatewayPaymentId || "";

              return (
                <>
                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-foreground">
                          {orderNum}
                        </span>
                        {orderNum && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(orderNum, "Order ID", e)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Copy Order ID"
                          >
                            <RiFileCopyLine className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Created: {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-semibold uppercase border",
                          selectedOrder.paymentStatus === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        )}
                      >
                        Payment: {selectedOrder.paymentStatus || "PAID"}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-semibold border",
                          selectedOrder.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        Sub: {selectedOrder.subscriptionStatus || "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Customer Details Box */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface border border-border/70 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Full Name</span>
                        <span className="font-semibold text-foreground text-sm block mt-0.5">
                          {customerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Email Address</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-foreground text-xs truncate">
                            {email || "—"}
                          </span>
                          {email && (
                            <button
                              type="button"
                              onClick={(e) => handleCopy(email, "email", e)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Copy email"
                            >
                              <RiFileCopyLine className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {phone && (
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Phone Number</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-foreground text-xs">
                              {phone}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(phone, "phone", e)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Copy phone"
                            >
                              <RiFileCopyLine className="size-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      {selectedOrder.telegramUsername && (
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Telegram</span>
                          <span className="font-semibold text-foreground text-xs block mt-0.5">
                            @{selectedOrder.telegramUsername.replace(/^@/, "")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subscription & Payment Details Box */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Plan & Gateway Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface border border-border/70 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Purchased Product</span>
                        <span className="font-semibold text-foreground text-xs block mt-0.5">
                          {selectedOrder.productTitle || "Trading Access"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Plan Duration</span>
                        <span className="font-semibold text-foreground text-xs block mt-0.5 font-mono">
                          {planDuration}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Total Paid Amount</span>
                        <span className="font-bold text-foreground text-base block mt-0.5 font-mono">
                          ₹{selectedOrder.amount?.toLocaleString("en-IN") || 0} {selectedOrder.currency || "INR"}
                        </span>
                      </div>
                      {paymentId && (
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Payment / Gateway ID</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xs text-foreground truncate">
                              {paymentId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(paymentId, "Payment ID", e)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Copy Payment ID"
                            >
                              <RiFileCopyLine className="size-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-black hover:bg-primary-hover shadow-xs transition-colors"
              >
                <RiExternalLinkLine className="size-3.5" />
                <span>Open in Orders Page</span>
              </Link>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  );
}
