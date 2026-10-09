"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  RiCheckLine,
  RiTelegramLine,
  RiFileCopyLine,
  RiCheckDoubleLine,
  RiPrinterLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiCalendarEventLine,
  RiCustomerService2Line,
  RiArrowRightLine,
} from "@remixicon/react";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "react-toastify";

interface OrderSuccessViewProps {
  order: Order;
}

export function OrderSuccessView({ order }: OrderSuccessViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!order.telegramInviteLink) return;
    navigator.clipboard.writeText(order.telegramInviteLink);
    setCopied(true);
    toast.success("Telegram invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Header Celebration Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 mb-2">
          <RiCheckLine className="h-11 w-11" />
        </div>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Order Confirmed &bull; #{order.orderNumber}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground font-heading">
          Payment Successful!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
          Thank you, <span className="font-semibold text-foreground">{order.firstName}</span>. Your subscription to{" "}
          <span className="font-semibold text-foreground">{order.productTitle}</span> is now active.
        </p>
      </motion.div>

      {/* Main Telegram Gateway Card (High Priority) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-b from-primary/10 via-card to-card p-6 sm:p-8 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary tracking-wide uppercase mb-1">
                <RiShieldCheckLine className="h-4 w-4" />
                <span>Instant Access Gateway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Join the Private Telegram VIP Channel
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Use your private, single-use invite link below to enter immediately.
              </p>
            </div>

            {order.telegramInviteLink && (
              <a
                href={order.telegramInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-black font-extrabold text-sm px-7 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  <RiTelegramLine className="h-5 w-5" />
                  <span>Join VIP Telegram Channel</span>
                </Button>
              </a>
            )}
          </div>

          {/* Invite Link Box */}
          {order.telegramInviteLink ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-2xl bg-surface/80 border border-border">
              <div className="flex-1 font-mono text-xs text-foreground/90 truncate px-2 select-all">
                {order.telegramInviteLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 text-xs flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <RiCheckDoubleLine className="h-4 w-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <RiFileCopyLine className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface/60 border border-border text-xs text-muted-foreground">
              Your Telegram channel invite link will be issued and emailed to{" "}
              <strong className="text-foreground">{order.email}</strong> shortly.
            </div>
          )}

          {/* 3-Step Simple Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-border/80">
            <div className="p-3.5 rounded-xl bg-surface/40 border border-border/50 text-xs">
              <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[11px]">
                  1
                </span>
                <span>Open Telegram</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Make sure you have Telegram installed on your mobile or desktop device.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface/40 border border-border/50 text-xs">
              <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[11px]">
                  2
                </span>
                <span>Click the Link</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Tap the join button. The single-use link activates your verified entry.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface/40 border border-border/50 text-xs">
              <div className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[11px]">
                  3
                </span>
                <span>Receive Live Trades</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Enjoy uninterrupted real-time analysis, strategies, and member updates.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription Breakdown & Receipt Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-md"
      >
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <h2 className="text-lg font-bold text-foreground font-heading">
            Subscription &amp; Payment Receipt
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs flex items-center gap-1.5 print:hidden"
          >
            <RiPrinterLine className="h-4 w-4" />
            <span>Print Receipt</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RiTimeLine className="h-3.5 w-3.5 text-primary" />
              <span>Subscription Status</span>
            </span>
            <div className="text-sm font-bold text-emerald-500">
              {order.subscriptionStatus === "ACTIVE" ? "ACTIVE & VERIFIED" : order.subscriptionStatus}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RiCalendarEventLine className="h-3.5 w-3.5 text-primary" />
              <span>Activated On</span>
            </span>
            <div className="text-sm font-bold text-foreground">
              {order.startDate ? formatDate(order.startDate) : formatDate(order.createdAt)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RiCalendarEventLine className="h-3.5 w-3.5 text-amber-500" />
              <span>Valid Until</span>
            </span>
            <div className="text-sm font-bold text-foreground">
              {order.expiryDate ? formatDate(order.expiryDate) : "Lifetime"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 space-y-1">
            <span className="text-xs text-muted-foreground">Amount Paid</span>
            <div className="text-base font-extrabold text-primary">
              ₹{order.amount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Detailed Item Breakdown Table */}
        <div className="border border-border/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-surface/80 text-muted-foreground font-semibold border-b border-border/80">
              <tr>
                <th className="py-3 px-4">Plan Description</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-center">SKU</th>
                <th className="py-3 px-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              <tr>
                <td className="py-4 px-4 font-semibold">
                  {order.productTitle} — <span className="text-muted-foreground font-normal">{order.variationTitle}</span>
                </td>
                <td className="py-4 px-4 text-center text-muted-foreground">
                  {order.durationValue} {order.durationUnit}
                </td>
                <td className="py-4 px-4 text-center font-mono text-xs text-muted-foreground">
                  {order.sku}
                </td>
                <td className="py-4 px-4 text-right font-bold text-foreground">
                  ₹{order.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Customer Information Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-surface/40 border border-border/60">
            <div className="font-semibold text-foreground text-sm mb-1">Subscriber Details</div>
            <div className="flex justify-between text-muted-foreground">
              <span>Name:</span>
              <span className="text-foreground font-medium">{order.firstName} {order.lastName}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Verified Email:</span>
              <span className="text-foreground font-medium">{order.email}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phone:</span>
              <span className="text-foreground font-medium">{order.phoneNumber}</span>
            </div>
            {order.telegramUsername && (
              <div className="flex justify-between text-muted-foreground">
                <span>Telegram:</span>
                <span className="text-foreground font-medium">{order.telegramUsername}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-surface/40 border border-border/60">
            <div className="font-semibold text-foreground text-sm mb-1">Payment Details</div>
            <div className="flex justify-between text-muted-foreground">
              <span>Gateway:</span>
              <span className="text-foreground font-medium">{order.paymentGateway || "RAZORPAY"}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Status:</span>
              <span className="text-emerald-500 font-semibold">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Order Reference:</span>
              <span className="font-mono text-foreground">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Confirmation Email:</span>
              <span className="text-emerald-500 font-medium">Dispatched</span>
            </div>
          </div>
        </div>

        {/* Footer Support Navigation */}
        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RiCustomerService2Line className="h-4 w-4 text-primary" />
            <span>Need assistance? Contact our team at care.traderscommunity@gmail.com</span>
          </div>

          <Link href="/courses">
            <Button variant="secondary" size="md" className="text-xs flex items-center gap-1.5">
              <span>Explore More Courses &amp; Analysis</span>
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
